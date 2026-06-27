# Slide-to-Order feature — hand-off

This is the "slide to generate invoice" control that replaced the tap button which creates the
order in the seller app (`Apex Seller Mobile.dc.html`). It lives in the **payment bottom-sheet**
(`kind === 'payment'`). Dragging a knob across a pill triggers the existing `confirmPayment()`
(which generates the invoice / creates the order). Releasing before the end snaps it back.

There are **3 pieces**:
1. The template markup (the slider UI).
2. The two logic methods that drive the drag (`slideStart`, `slideComplete`).
3. One line of wiring in `renderVals` that exposes `slideStart` to the template.

---

## How it works (read this first)

- The drag is **NOT** driven by React/component state — that would re-render on every pointer
  move and stutter. Instead the handlers mutate the DOM nodes' inline styles directly
  (`knob.style.left`, `fill.style.width`, `label.style.opacity`). This keeps it 60fps and the
  state self-contained.
- Elements are found by fixed `id`s (`sdSlideTrack`, `sdSlideFill`, `sdSlideLabel`,
  `sdSlideKnob`, `sdSlideKnobIcon`).
- `onPointerDown` on the knob calls `slideStart(e)`. That attaches **document-level**
  `pointermove` / `pointerup` listeners (so the drag continues even if the pointer leaves the
  knob) and uses `setPointerCapture` for robustness. Pointer events cover both mouse and touch.
- `max` = how far the knob can travel = `trackWidth - knobWidth - pad*2`.
- On each move it clamps the knob position to `[0, max]`, grows the green fill behind it, and
  fades the label.
- When the knob reaches the end (`nx >= max - 1.5`) it sets a one-shot guard `this._slid`,
  removes the listeners, and calls `slideComplete()`.
- `slideComplete()` snaps the knob fully right, fills the track, swaps the arrow icon for a
  checkmark, shows "Generating invoice…", does an optional haptic buzz, then after 360ms calls
  the **existing** `confirmPayment()` — so order creation is unchanged, only the trigger UI is.
- If the user lets go early, `up()` runs, sees `_slid` is false, and animates everything back to
  the resting position.
- Because the sheet is conditionally rendered (`<sc-if>`), the markup remounts fresh each time
  the payment sheet opens, so the inline default styles (`left:4px`, fill `width:54px`, label
  opacity 1, arrow icon) reset automatically. `_slid` is reset in both `slideStart` and
  `slideComplete`.

---

## 1. Template markup

Replaces the old:
```html
<button onClick="{{ confirmPayment }}" ...> Generate invoice </button>
```
with:

```html
<div id="sdSlideTrack" style="position:relative;width:100%;height:58px;border-radius:16px;background:#EAEDF1;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;box-shadow:inset 0 1px 2px rgba(15,23,42,0.06)">
  <div id="sdSlideFill" style="position:absolute;left:0;top:0;bottom:0;width:54px;border-radius:16px;background:linear-gradient(150deg,#10B981,#059669);transition:none"></div>
  <div id="sdSlideLabel" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:9px;padding-left:34px;color:#475569;font-size:15px;font-weight:600;letter-spacing:0.01em;pointer-events:none">
    <span>Slide to generate invoice</span>
    <span style="display:inline-flex;color:#10B981">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" style="opacity:0.45"><path d="M9 6l6 6-6 6"/></svg>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" style="opacity:0.75;margin-left:-9px"><path d="M9 6l6 6-6 6"/></svg>
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" style="margin-left:-9px"><path d="M9 6l6 6-6 6"/></svg>
    </span>
  </div>
  <div id="sdSlideKnob" onPointerDown="{{ slideStart }}" style="position:absolute;left:4px;top:4px;width:50px;height:50px;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none;box-shadow:0 4px 12px -2px rgba(5,150,105,0.45),0 1px 2px rgba(15,23,42,0.1)" style-active="cursor:grabbing">
    <svg id="sdSlideKnobIcon" width="22" height="22" fill="none" stroke="#059669" stroke-width="2.4" viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
  </div>
</div>
```

> Note: `onPointerDown="{{ slideStart }}"` and `style-active="..."` are this project's DC template
> syntax. In plain React/JSX this is `onPointerDown={slideStart}` and an `:active` CSS rule; in
> plain HTML it's `onpointerdown="slideStart(event)"`. The geometry/logic is identical.

---

## 2. Logic methods (`slideStart`, `slideComplete`)

Added to the component class, just before the existing `confirmPayment()`:

```js
slideStart(e){
  const track=document.getElementById('sdSlideTrack');
  const knob=document.getElementById('sdSlideKnob');
  const fill=document.getElementById('sdSlideFill');
  const label=document.getElementById('sdSlideLabel');
  if(!track||!knob||!fill||!label) return;
  if(e&&e.preventDefault) e.preventDefault();
  this._slid=false;
  const pad=4, knobW=knob.offsetWidth;
  const max=track.offsetWidth - knobW - pad*2;
  const startX=(e.touches?e.touches[0].clientX:e.clientX);
  const startLeft=(parseFloat(knob.style.left)||pad)-pad;
  knob.style.transition='none'; fill.style.transition='none';
  try{ if(e.pointerId!=null) knob.setPointerCapture(e.pointerId); }catch(_){}
  const setPos=(nx)=>{ knob.style.left=(pad+nx)+'px'; fill.style.width=(pad+knobW+nx)+'px'; label.style.opacity=String(Math.max(0,1-(nx/max)*1.7)); };
  const move=(ev)=>{
    if(this._slid) return;
    const x=(ev.touches?ev.touches[0].clientX:ev.clientX);
    let nx=Math.min(max,Math.max(0,startLeft+(x-startX)));
    setPos(nx);
    if(nx>=max-1.5){ this._slid=true; cleanup(); this.slideComplete(); }
  };
  const up=()=>{
    cleanup();
    if(this._slid) return;
    knob.style.transition='left .28s cubic-bezier(.34,1.4,.5,1)';
    fill.style.transition='width .28s cubic-bezier(.34,1.4,.5,1)';
    label.style.transition='opacity .25s ease';
    knob.style.left=pad+'px'; fill.style.width=(pad+knobW)+'px'; label.style.opacity='1';
  };
  const cleanup=()=>{ document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up); document.removeEventListener('pointercancel',up); };
  document.addEventListener('pointermove',move);
  document.addEventListener('pointerup',up);
  document.addEventListener('pointercancel',up);
}

slideComplete(){
  const track=document.getElementById('sdSlideTrack');
  const knob=document.getElementById('sdSlideKnob');
  const fill=document.getElementById('sdSlideFill');
  const label=document.getElementById('sdSlideLabel');
  const icon=document.getElementById('sdSlideKnobIcon');
  if(knob&&fill&&track){
    const pad=4, knobW=knob.offsetWidth, max=track.offsetWidth-knobW-pad*2;
    knob.style.transition='left .2s cubic-bezier(.22,1,.36,1)';
    fill.style.transition='width .2s cubic-bezier(.22,1,.36,1)';
    knob.style.left=(pad+max)+'px'; fill.style.width='100%';
  }
  if(icon) icon.innerHTML='<path d="M20 6L9 17l-5-5"/>';
  if(label){ label.style.transition='opacity .15s ease'; label.style.opacity='0'; label.innerHTML='<span style="color:#04140d;font-size:15px;font-weight:650">Generating invoice…</span>'; requestAnimationFrame(()=>{ label.style.paddingLeft='0'; label.style.opacity='1'; }); }
  if(navigator.vibrate){ try{ navigator.vibrate(18); }catch(_){} }
  setTimeout(()=>{ this._slid=false; this.confirmPayment(); },360);
}
```

`confirmPayment()` is the **pre-existing** method that actually creates the order/invoice — it is
unchanged. The slider just calls it at the end of a successful slide.

---

## 3. renderVals wiring

In the `kind === 'payment'` branch of `renderVals()`, expose the handler to the template
(added alongside the existing `v.confirmPayment`):

```js
v.confirmPayment=()=>this.confirmPayment();
v.slideStart=e=>this.slideStart(e);
```

---

## Tunable knobs (pun intended)

- `pad` (4) — gap between knob and track edges.
- Knob size: `width/height:50px` in markup → `knobW` is read live via `offsetWidth`, so just
  change the CSS.
- Track height: `58px`.
- Completion threshold: `nx >= max - 1.5` (how close to the end counts as "done").
- Snap-back easing: `cubic-bezier(.34,1.4,.5,1)` (slight overshoot).
- Label fade rate: the `*1.7` multiplier in `setPos` (higher = fades sooner).
- Delay before the action fires: `setTimeout(..., 360)`.

## Porting to plain React (no DC runtime)

- Give the elements `ref`s instead of `id`s, or keep `id`s and `getElementById` — both work.
- `onPointerDown={slideStart}` on the knob.
- Keep everything else identical; the direct-DOM style mutation pattern is framework-agnostic and
  is the reason it stays smooth.
