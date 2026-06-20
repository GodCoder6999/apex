-- Optional demo data for the API. Import AFTER schema.sql. Safe to skip if you
-- want to start empty and add catalog through the website.
-- Seller passwords are stored in plain text here for demo login; the API will
-- re-hash them with bcrypt the next time a seller is saved from the UI.

INSERT INTO categories (id,name,active) VALUES
 ('c-lap','Laptops',1),('c-pc','Desktops & PCs',1),('c-cctv','CCTV & Security',1),
 ('c-comp','Components',1),('c-net','Networking',1),('c-acc','Accessories',1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (id,name,category_id,barcode,price,cost_price,gst_rate,hsn,brand,specs,active) VALUES
 ('p-1','ThinkPad X1 Carbon Gen 12','c-lap','8901234500011',168000,142000,18,'8471','Lenovo','i7-1365U · 32GB · 1TB SSD · 14" 2.8K',1),
 ('p-2','MacBook Air 15" M3','c-lap','8901234500028',134900,118500,18,'8471','Apple','M3 · 16GB · 512GB',1),
 ('p-3','IdeaPad Slim 5','c-lap','8901234500035',62990,53500,18,'8471','Lenovo','Ryzen 7 · 16GB · 512GB',1),
 ('p-4','Apex Gaming Tower RTX 4070','c-pc','8901234500042',142500,121000,18,'8471','Apex Build','i5-14600KF · 32GB · RTX 4070 · 1TB',1),
 ('p-5','Office Mini PC','c-pc','8901234500059',38900,32000,18,'8471','Intel','i3-1215U · 8GB · 256GB',1),
 ('p-6','Dome Camera 5MP IP','c-cctv','8901234500066',4290,3100,18,'8525','Hikvision','5MP · IR 30m · PoE',1),
 ('p-7','NVR 8-Channel 4K','c-cctv','8901234500073',11900,9200,18,'8521','CP Plus','8CH · 4K · 2 SATA',1),
 ('p-8','Bullet Camera 4MP','c-cctv','8901234500080',3490,2450,18,'8525','Dahua','4MP · IP67 · IR',1),
 ('p-9','RTX 4070 Ti Super','c-comp','8901234500097',84990,73500,18,'8473','ASUS','16GB GDDR6X',1),
 ('p-10','Ryzen 7 7800X3D','c-comp','8901234500103',38990,33200,18,'8542','AMD','8C/16T · AM5',1),
 ('p-11','32GB DDR5 6000 Kit','c-comp','8901234500110',9800,7600,18,'8473','Corsair','2x16GB · CL30',1),
 ('p-12','WiFi 6 Router AX3000','c-net','8901234500127',6499,4800,18,'8517','TP-Link','AX3000 · Dual band',1),
 ('p-13','24-Port Gigabit Switch','c-net','8901234500134',9990,7900,18,'8517','Netgear','Unmanaged · Metal',1),
 ('p-14','Mechanical Keyboard TKL','c-acc','8901234500141',7490,5400,18,'8471','Keychron','Hot-swap · RGB',1),
 ('p-15','27" 165Hz Monitor','c-acc','8901234500158',21900,17800,18,'8528','LG','QHD · IPS · 165Hz',1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO sellers (id,name,phone,email,password,active) VALUES
 ('s-1','Imran Sheikh','+91 98311 22001','imran@apex.in','imran@123',1),
 ('s-2','Priya Das','+91 98311 22002','priya@apex.in','priya@123',1),
 ('s-3','Sourav Roy','+91 98311 22003','sourav@apex.in','sourav@123',1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO customers (id,name,phone,address,gstin) VALUES
 ('cu-1','Debashish Traders','+91 90070 11001','Burrabazar, Kolkata','19AAACD1234M1Z2'),
 ('cu-2','Sandeep Kumar','+91 90070 11002','Salt Lake, Kolkata',NULL),
 ('cu-3','TechZone Retail','+91 90070 11003','Esplanade, Kolkata','19AABCT5678N1Z9'),
 ('cu-4','Ananya Ghosh','+91 90070 11004','Behala, Kolkata',NULL),
 ('cu-5','Sunrise Cyber Cafe','+91 90070 11005','Howrah',NULL),
 ('cu-6','Rakesh Agarwal','+91 90070 11006',NULL,NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name);
