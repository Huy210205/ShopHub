package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.Role;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure core users exist
        initializeUsers();

        // Check if catalog is already seeded
        if (productRepository.count() > 0) {
            System.out.println("=== E-Commerce catalog already seeded with " + productRepository.count() + " products ===");
            return;
        }

        System.out.println("=== Seeding premium e-commerce catalog with 150 realistic products ===");
        
        try {
            // Clear any old/default products and categories to prevent conflicts/duplicates
            productRepository.deleteAll();
            categoryRepository.deleteAll();
        } catch (Exception e) {
            // Ignore if foreign key constraint exists from carts/orders
        }

        // 11 Categories
        Category electronics = categoryRepository.save(Category.builder()
                .name("Electronics").description("Smartphones, wearables, smart devices, and general consumer electronics.").build());
        Category fashionMen = categoryRepository.save(Category.builder()
                .name("Fashion - Men").description("Men apparel, activewear, premium shoes, wallets, sunglasses, and essentials.").build());
        Category fashionWomen = categoryRepository.save(Category.builder()
                .name("Fashion - Women").description("Premium sarees, kurtis, designer handbags, luxury heels, jewelry, and cosmetics.").build());
        Category grocery = categoryRepository.save(Category.builder()
                .name("Grocery").description("Essential grains, daily staples, organic tea, beverages, spices, and dry fruits.").build());
        Category homeKitchen = categoryRepository.save(Category.builder()
                .name("Home & Kitchen").description("Elegant dining, sofas, comfort bedding, smart kitchen tools, and premium appliances.").build());
        Category mobilesAccessories = categoryRepository.save(Category.builder()
                .name("Mobiles & Accessories").description("Phone protective covers, screen guards, high-capacity power banks, and adapters.").build());
        Category computers = categoryRepository.save(Category.builder()
                .name("Computers").description("High-performance laptops, prebuilt gaming PCs, displays, keyboards, and hardware upgrades.").build());
        Category books = categoryRepository.save(Category.builder()
                .name("Books").description("Software engineering handbooks, coding cookbooks, aptitude preparation, and ML books.").build());
        Category sports = categoryRepository.save(Category.builder()
                .name("Sports").description("Durable cricket gear, footballs, pro rackets, active dumbbells, and active yoga mats.").build());
        Category beautyPersonalCare = categoryRepository.save(Category.builder()
                .name("Beauty & Personal Care").description("Gentle facewash, organic shampoo, trimmer grooming, skin moisturizers, and fragrances.").build());
        Category gaming = categoryRepository.save(Category.builder()
                .name("Gaming").description("Flagship gaming consoles, mechanical chairs, immersive headsets, and virtual reality gear.").build());

        // ------------------------------------------
        // CATEGORY 1: ELECTRONICS (20 Products)
        // ------------------------------------------
        saveProduct("iPhone 16 Pro", "Apple flagship smartphone featuring Titanium design, A18 Pro chip, and enhanced camera control.", "119900.00", 25, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", electronics, 4.9, 128);
        saveProduct("Samsung Galaxy S26 Ultra", "Samsung flagship smartphone with 200MP camera, built-in S-Pen, and Snapdragon 8 Gen 5.", "124999.00", 30, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400", electronics, 4.8, 95);
        saveProduct("OnePlus 14", "OnePlus speed champion with 150W SUPERVOOC charging, Hassleblad triple camera system.", "64999.00", 45, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400", electronics, 4.6, 74);
        saveProduct("Google Pixel 10 Pro", "Google flagship with revolutionary AI capabilities, clean Android UI, and Gemini Nano onboard.", "99999.00", 20, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400", electronics, 4.7, 56);
        saveProduct("iPad Pro M4", "Apple premium tablet with ultra-thin chassis, Tandem OLED ProMotion screen, and M4 chip power.", "89900.00", 15, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", electronics, 4.9, 84);
        saveProduct("Samsung Tab S10 Ultra", "Massive 14.6-inch dynamic AMOLED display Android tablet with secure Knox defense system.", "108999.00", 18, "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=400", electronics, 4.7, 42);
        saveProduct("MacBook Air M5", "Apple thin and light laptop powered by next-gen fanless M5 silicon chip with 24hr battery.", "114900.00", 22, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", electronics, 4.8, 110);
        saveProduct("Dell XPS 15 Platinum", "Dell high-performance premium laptop with 4K InfinityEdge touchscreen and Intel i9.", "189999.00", 12, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400", electronics, 4.5, 38);
        saveProduct("HP Pavilion Plus 14", "Portable everyday workhorse laptop with crisp OLED display and fast AMD Ryzen 7 chip.", "67999.00", 35, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400", electronics, 4.3, 62);
        saveProduct("Lenovo ThinkPad X1 Carbon", "Durable, lightweight carbon-fiber business laptop with legendary ergonomic keyboard.", "145999.00", 15, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400", electronics, 4.7, 50);
        saveProduct("ASUS ROG Strix Scar 16", "Asus elite gaming laptop with Intel Core i9, NVIDIA RTX 4090, and tri-fan cooling tech.", "274999.00", 8, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400", electronics, 4.9, 29);
        saveProduct("Apple Watch Ultra 3", "Rugged outdoor smartwatch with ultra-bright titanium casing, precise GPS, and diving depth.", "89900.00", 18, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400", electronics, 4.8, 73);
        saveProduct("Samsung Galaxy Watch 8", "Intelligent health tracking circular smartwatch with Advanced BioActive sensor suite.", "32999.00", 40, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400", electronics, 4.5, 81);
        saveProduct("boAt Storm Call 3", "Budget smartwatch with large HD screen, Bluetooth hands-free call, and 7-day battery.", "2499.00", 150, "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400", electronics, 4.1, 312);
        saveProduct("AirPods Pro 3", "Apple premium active noise cancelling wireless earphones with Adaptive audio features.", "24900.00", 85, "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=400", electronics, 4.8, 204);
        saveProduct("Sony WH-1000XM5", "Sony leading over-ear wireless headphones with auto NC optimizer and exceptional bass.", "29990.00", 60, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400", electronics, 4.7, 142);
        saveProduct("JBL Flip 6 Waterproof", "Portable Bluetooth outdoor speaker with deep dual passive radiators and IP67 rating.", "9999.00", 110, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", electronics, 4.5, 188);
        saveProduct("Logitech MX Master 3S", "Ergonomic precision wireless mouse featuring quiet-click switches and magspeed scrolling.", "9495.00", 95, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", electronics, 4.8, 167);
        saveProduct("Keychron K2 Mechanical", "Compact 75% layout custom wireless mechanical keyboard with blue clicky switches.", "7999.00", 40, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", electronics, 4.6, 92);
        saveProduct("BenQ Mobiuz 32\" Gaming", "Curved high-refresh-rate IPS panel gaming monitor with dual built-in subwoofers.", "34999.00", 15, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", electronics, 4.6, 45);

        // ------------------------------------------
        // CATEGORY 2: FASHION - MEN (20 Products)
        // ------------------------------------------
        saveProduct("Classic Cotton T-Shirt", "Pack of 3 premium combed cotton slim fit t-shirts for comfortable everyday wear.", "1299.00", 120, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", fashionMen, 4.2, 88);
        saveProduct("Premium Oxford Linen Shirt", "Crisp semi-formal breathable linen shirt crafted for sharp summer styling.", "2499.00", 75, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", fashionMen, 4.4, 52);
        saveProduct("Levi's 511 Slim Jeans", "Standard fit durable indigo blue stretchable denim jeans with copper rivets.", "3999.00", 90, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", fashionMen, 4.5, 134);
        saveProduct("Van Heusen Formal Trousers", "Slim-fit flat-front lightweight poly-viscose breathable formal uniform pants.", "2199.00", 65, "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400", fashionMen, 4.1, 47);
        saveProduct("Raymond Navy Blue Blazer", "Sharp double-vented tailored wool blend executive blazer for corporate meetings.", "7999.00", 25, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400", fashionMen, 4.6, 32);
        saveProduct("Adidas Essentials Hoodie", "Soft fleece-lined pullover casual hoodie with drawstring and classic front pouch.", "3499.00", 80, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", fashionMen, 4.5, 96);
        saveProduct("Windproof Puffer Jacket", "Insulated warm winter outerwear with water-resistant zip-up hood shielding.", "4999.00", 40, "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400", fashionMen, 4.4, 61);
        saveProduct("Nike Dry-Fit Track Pants", "Sweat-wicking lightweight activewear pants for gym training and athletics.", "2799.00", 110, "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400", fashionMen, 4.6, 78);
        saveProduct("Puma Tech Shorts", "Extremely comfortable fast-dry breathable workout shorts with zipped pockets.", "1499.00", 95, "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400", fashionMen, 4.3, 49);
        saveProduct("Manyavar Designer Kurta", "Elegant ethnic self-design silk blend wedding wear kurta with embroidery.", "3999.00", 30, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400", fashionMen, 4.7, 43);
        saveProduct("Puma Suede Sneakers", "Iconic retro low-top street sneakers featuring soft gold-foil brand decals.", "5999.00", 85, "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400", fashionMen, 4.6, 120);
        saveProduct("Hush Puppies Formal Derby", "Polished genuine full-grain leather dress shoes with cushioned footbeds.", "4499.00", 50, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400", fashionMen, 4.4, 38);
        saveProduct("Nike Air Zoom Running", "Advanced cushioning lightweight road-running sneakers with mesh uppers.", "8499.00", 70, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", fashionMen, 4.7, 142);
        saveProduct("Sparx Comfort Sandals", "Rugged everyday usage adjustable-strap durable synthetic walking sandals.", "1299.00", 140, "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400", fashionMen, 4.0, 94);
        saveProduct("Tommy Hilfiger Leather Belt", "Reversible sleek dark brown and black full-grain leather accessories strap.", "2999.00", 80, "https://images.unsplash.com/photo-1624222247344-550fb8efeb31?w=400", fashionMen, 4.3, 56);
        saveProduct("WildHorn Bi-Fold Wallet", "Compact structured genuine leather pockets organizer with RFID shielding block.", "999.00", 160, "https://images.unsplash.com/photo-1627124718414-007706c69f3a?w=400", fashionMen, 4.2, 185);
        saveProduct("Ray-Ban Wayfarer Classic", "Iconic impact-resistant polarized protective glass shades with black acetate.", "8490.00", 45, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", fashionMen, 4.8, 104);
        saveProduct("Casio Edifice Chronograph", "Premium stainless steel structural tachymeter multi-dial formal wrist watch.", "11995.00", 35, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", fashionMen, 4.7, 72);
        saveProduct("Under Armour Sports Cap", "Curved sweat-wicking lightweight athletic cap with adjustable snap buckle.", "1499.00", 110, "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", fashionMen, 4.2, 86);
        saveProduct("Adidas Cushioned Socks (x3)", "Pack of 3 high-ankle soft breathable moisture-wicking athletic knit socks.", "599.00", 200, "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400", fashionMen, 4.4, 91);

        // ------------------------------------------
        // CATEGORY 3: FASHION - WOMEN (15 Products)
        // ------------------------------------------
        saveProduct("Banarasi Silk Saree", "Traditional hand-woven pure Banarasi silk saree with ornate rich golden zari border.", "12499.00", 15, "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400", fashionWomen, 4.8, 25);
        saveProduct("Libas Floral Print Kurti", "A-line light cotton ethnic designer daily wear summer dress.", "1499.00", 80, "https://images.unsplash.com/photo-1608748010899-18f300247112?w=400", fashionWomen, 4.3, 76);
        saveProduct("Ornate Bridal Lehenga", "Exquisite sequence embroidered velvet lehenga choli with dupatta drape.", "24999.00", 8, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", fashionWomen, 4.9, 14);
        saveProduct("Zara Ribbed Knit Top", "Casual breathable crewneck fitted stretchable top for office layouts.", "1799.00", 95, "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400", fashionWomen, 4.1, 52);
        saveProduct("Levi's High Rise Jeans", "Comfortable stretchable skinny fit denim jeans molding at natural waist.", "3499.00", 75, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", fashionWomen, 4.4, 63);
        saveProduct("H&M Plated Pleated Skirt", "Elegant high-waist flowy casual midi skirt with elasticized waistband.", "2299.00", 60, "https://images.unsplash.com/photo-1583496661160-fb488653d5e0?w=400", fashionWomen, 4.2, 44);
        saveProduct("Forever New Maxi Dress", "Beautiful floral georgette long party dress with pleated wrap waistline.", "5999.00", 25, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", fashionWomen, 4.6, 31);
        saveProduct("Baggit Textured Handbag", "Stylish leatherette structured top-handle shopper bag with multiple sections.", "2999.00", 85, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", fashionWomen, 4.2, 88);
        saveProduct("Bata Premium Ankle Heels", "Classy buckle strap block high heels shoes with orthopedic soft padding.", "2499.00", 45, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", fashionWomen, 4.3, 56);
        saveProduct("Catwalk Comfort Flats", "Elegant ethnic slip-on daily wear sandals with metallic embroidery.", "1499.00", 90, "https://images.unsplash.com/photo-1596702952706-90f4de559237?w=400", fashionWomen, 4.0, 72);
        saveProduct("Giva Sterling Silver Necklace", "Hypoallergenic 925 solid silver heart pendant chain for special gifts.", "2199.00", 110, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", fashionWomen, 4.7, 98);
        saveProduct("Lakme Complete Makeup Kit", "Standard professional cosmetics organizer with base primers, eye shades and brushes.", "4499.00", 30, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", fashionWomen, 4.5, 41);
        saveProduct("MAC Retro Matte Lipstick", "MAC signature long-lasting high pigment smudge-free red velvet shade.", "2150.00", 120, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400", fashionWomen, 4.8, 162);
        saveProduct("Chanel Coco Mademoiselle", "Classic absolute luxury intense floral and woody vaporisateur fragrance.", "12500.00", 20, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", fashionWomen, 4.9, 87);
        saveProduct("Fossil Stella Rose Gold", "Charming crystal-studded multi-function quartz dial women luxury watch.", "12495.00", 40, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400", fashionWomen, 4.7, 59);

        // ------------------------------------------
        // CATEGORY 4: GROCERY (15 Products)
        // ------------------------------------------
        saveProduct("India Gate Basmati Rice", "Premium long grain aged aromatic Basmati rice ideal for royal biryani.", "210.00", 500, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", grocery, 4.6, 212);
        saveProduct("Aashirvaad Shudh Chakki Atta", "100% stone-ground whole wheat grain clean flour for soft fresh rotis.", "265.00", 450, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", grocery, 4.5, 185);
        saveProduct("Madhur Pure Refined Sugar", "Sulphur-free clean crystallized sweetness sugar extracted from rich cane.", "55.00", 600, "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=400", grocery, 4.2, 94);
        saveProduct("Tata Salt Vacuum Evaporated", "Iodized pure active table salt vital for daily nutritional immunity.", "28.00", 1000, "https://images.unsplash.com/photo-1604838605614-7ec571610427?w=400", grocery, 4.5, 340);
        saveProduct("Taj Mahal Premium Tea", "Exquisite select blend of orange pekoe tea leaves with rich classic aroma.", "420.00", 180, "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400", grocery, 4.4, 82);
        saveProduct("Nescafe Classic Instant Coffee", "Rich robust double-roasted bold beans instant coffee booster powder.", "315.00", 200, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400", grocery, 4.5, 148);
        saveProduct("Amulya Dairy Milk Powder", "Rich high-fat pure milk solids powder perfect for thick creamy tea.", "295.00", 120, "https://images.unsplash.com/photo-1356909114-f6e7ad7d3136?w=400", grocery, 4.3, 76);
        saveProduct("Fortune Mustard Cooking Oil", "Traditional cold-pressed strong pungent aroma pure active mustard oil.", "175.00", 300, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", grocery, 4.4, 110);
        saveProduct("Oreo Chocolate Sandwich", "Crisp chocolate biscuit disks loaded with rich sweet vanilla cream.", "40.00", 800, "https://images.unsplash.com/photo-1558961309-dbdf71791a5a?w=400", grocery, 4.3, 290);
        saveProduct("Cadbury Dairy Milk Silk", "Extremely smooth melting premium milk chocolate block bar.", "80.00", 500, "https://images.unsplash.com/photo-1548907040-4d42b52125bf?w=400", grocery, 4.7, 412);
        saveProduct("Coca-Cola Soft Drink 1.25L", "Crisp effervescent carbonated refreshing cola drink served chilled.", "70.00", 400, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", grocery, 4.1, 154);
        saveProduct("Maggi 2-Min Noodles", "Pack of 12 instant wheat noodles integrated with classic hot spice tastemaker.", "168.00", 500, "https://images.unsplash.com/photo-1612966608967-302fc5f34030?w=400", grocery, 4.6, 521);
        saveProduct("Catch Pure Turmeric Powder", "Rich golden yellow high curcumin content natural ground spices.", "65.00", 250, "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400", grocery, 4.2, 73);
        saveProduct("Organic Premium Almonds", "Vacuum packed raw crunchy whole California almonds rich in vitamin E.", "850.00", 140, "https://images.unsplash.com/photo-1508061253366-f7da158b6d4b?w=400", grocery, 4.6, 115);
        saveProduct("Dabur 100% Pure Honey", "Naturally sourced multi-floral sweet healthy active honey elixir.", "399.00", 160, "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400", grocery, 4.3, 134);

        // ------------------------------------------
        // CATEGORY 5: HOME & KITCHEN (15 Products)
        // ------------------------------------------
        saveProduct("Sheesham Wood Dining Table", "Elegant 6-seater premium Sheesham hardwood dining set with upholstered chairs.", "28999.00", 10, "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400", homeKitchen, 4.7, 18);
        saveProduct("L-Shaped Sectional Sofa", "Modern plush grey fabric structural L-shaped 5-seater high-comfort sofa.", "34999.00", 8, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", homeKitchen, 4.5, 23);
        saveProduct("Ergonomic Mesh Desk Chair", "High-back mesh swivel office chair with lumber support adjustments.", "6999.00", 45, "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=400", homeKitchen, 4.4, 67);
        saveProduct("Sturdy Metal Study Table", "Minimalist writing desk with integrated steel supports and wooden desk top.", "4499.00", 30, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400", homeKitchen, 4.2, 34);
        saveProduct("King Size Storage Bed", "Sturdy hydraulic lift king-size engineered wood bed frame with headboard.", "21999.00", 6, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400", homeKitchen, 4.6, 12);
        saveProduct("Sleepwell Ortho Mattress", "Dual comfort orthopedic memory foam pressure-relieving 6-inch mattress.", "12499.00", 15, "https://images.unsplash.com/photo-1505693395321-883724634266?w=400", homeKitchen, 4.8, 41);
        saveProduct("3-Door Wooden Wardrobe", "Spacious custom multi-shelf dark walnut wardrobe with dressing mirror.", "18999.00", 7, "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400", homeKitchen, 4.3, 15);
        saveProduct("Milton Insulated Bottle 1L", "Leak-proof double-walled active stainless steel vacuum temperature flask.", "999.00", 120, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", homeKitchen, 4.4, 182);
        saveProduct("Prestige Non-Stick Set (x3)", "Durable granite-coated induction safe frypan, kadai, and tawa pans bundle.", "3299.00", 55, "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", homeKitchen, 4.5, 92);
        saveProduct("Hawkins Pressure Cooker 5L", "Mirror polished high-grade pure aluminum hard dome safety cooker.", "2150.00", 80, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400", homeKitchen, 4.7, 210);
        saveProduct("Suciata 750W Mixer Grinder", "Heavy-duty motor companion with 3 stainless steel liquidizing grinding jars.", "3899.00", 65, "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400", homeKitchen, 4.3, 78);
        saveProduct("IFB 20L Microwave Oven", "Touch control convection microwave with speed defrost and preheat auto.", "9499.00", 25, "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400", homeKitchen, 4.5, 53);
        saveProduct("Philips 2000W Induction Cooktop", "Sensor touch sleek ceramic top fast heating digital display hot plate.", "3499.00", 50, "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400", homeKitchen, 4.4, 84);
        saveProduct("Samsung 253L Double Door Refrigerator", "Digital inverter energy saving frost-free double door smart fridge.", "24990.00", 14, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400", homeKitchen, 4.6, 67);
        saveProduct("LG 7kg Front Load Washer", "Direct drive intelligent steam cleaning quiet fully automatic washing machine.", "32999.00", 10, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400", homeKitchen, 4.8, 48);

        // ------------------------------------------
        // CATEGORY 6: MOBILES & ACCESSORIES (10 Products)
        // ------------------------------------------
        saveProduct("Spigen Rugged Armor Case", "Impact absorption flexible TPU case with carbon fiber textures for flagship.", "999.00", 180, "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=400", mobilesAccessories, 4.6, 214);
        saveProduct("Gorilla 9H Tempered Glass", "Edge-to-edge bubble-free ultra-clear oil-resistant glass screen shield.", "399.00", 300, "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=400", mobilesAccessories, 4.2, 148);
        saveProduct("Mi 20000mAh Power Bank 3i", "Triple output ports fast 18W charging high-density lithium polymer bank.", "2199.00", 140, "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=400", mobilesAccessories, 4.5, 310);
        saveProduct("Anker 65W GaN Fast Charger", "Extremely compact Gallium Nitride multi-port laptop & phone high-speed adapter.", "3999.00", 95, "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=400", mobilesAccessories, 4.8, 125);
        saveProduct("AmazonBasics Braided USB-C", "Heavy-duty double-braided nylon fast sync & charging USB-C cable (6ft).", "499.00", 400, "https://images.unsplash.com/photo-1619961313759-a172d47a5909?w=400", mobilesAccessories, 4.4, 189);
        saveProduct("Belkin 15W Wireless Pad", "Qi-certified sleek non-slip fast charging wireless pad with temperature block.", "2499.00", 60, "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=400", mobilesAccessories, 4.3, 72);
        saveProduct("Aluminum Desk Phone Stand", "Ergonomic multi-angle adjustable sturdy dock with protective rubber pads.", "799.00", 110, "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400", mobilesAccessories, 4.5, 142);
        saveProduct("OnePlus Buds Pro 2", "Smart adaptive active noise canceling dual driver high-fidelity earbuds.", "9999.00", 75, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", mobilesAccessories, 4.7, 108);
        saveProduct("SanDisk 128GB MicroSDXC", "Class 10 high-speed file transfer storage memory card with SD adapter.", "1299.00", 250, "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=400", mobilesAccessories, 4.6, 260);
        saveProduct("Spigen Magnetic Car Holder", "Heavy-duty dashboard air vent active security magnetic smartphone mount.", "1199.00", 130, "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=400", mobilesAccessories, 4.2, 83);

        // ------------------------------------------
        // CATEGORY 7: COMPUTERS (10 Products)
        // ------------------------------------------
        saveProduct("Apple MacBook Pro M4", "Apple powerhouse notebook with 10-core GPU, Liquid Retina XDR screen, 16GB RAM.", "169900.00", 14, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", computers, 4.9, 54);
        saveProduct("HP Omen Prebuilt Gaming PC", "Intel Core i7 liquid-cooled rig with NVIDIA RTX 4070, 32GB RAM, 1TB NVMe SSD.", "149999.00", 8, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400", computers, 4.7, 19);
        saveProduct("LG UltraGear 27\" IPS Monitor", "Sleek QHD borderless active display with 165Hz refresh and 1ms response.", "21999.00", 30, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", computers, 4.6, 64);
        saveProduct("Logitech Pebble Wireless Mouse", "Minimalist, slim, lightweight click silent Bluetooth office traveler mouse.", "1799.00", 110, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", computers, 4.3, 112);
        saveProduct("Corsair K70 RGB Keyboard", "Anodized aluminum structural mechanical keyboard with Cherry MX Speed switches.", "12499.00", 25, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", computers, 4.8, 47);
        saveProduct("Logitech C922 Pro Webcam", "High-definition 1080p dynamic video streaming camera with tripod stand.", "8999.00", 60, "https://images.unsplash.com/photo-1603539955702-b2586616035f?w=400", computers, 4.5, 94);
        saveProduct("Epson EcoTank Color Printer", "Multi-function continuous ink tank printer offering low-cost rich prints.", "14499.00", 22, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400", computers, 4.4, 76);
        saveProduct("Samsung 990 PRO NVMe 1TB", "PCIe Gen4 extreme speeds internal solid state drive with heat sink armor.", "9999.00", 95, "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400", computers, 4.9, 138);
        saveProduct("Seagate Expansion 2TB External", "Ultra-portable drag-and-drop storage companion USB 3.0 backup drive.", "5499.00", 120, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", computers, 4.3, 142);
        saveProduct("NVIDIA RTX 4070 Super GPU", "Next-gen twin edge cooling graphics card with 12GB high-speed GDDR6X RAM.", "64999.00", 12, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400", computers, 4.8, 38);

        // ------------------------------------------
        // CATEGORY 8: BOOKS (10 Products)
        // ------------------------------------------
        saveProduct("Java: The Complete Reference", "Comprehensive master resource on Java programming language, API syntax, and patterns.", "899.00", 110, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.8, 145);
        saveProduct("Python Programming Cookbook", "Over 100 highly practical structural recipes for fast backend scripting and databases.", "650.00", 90, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.6, 73);
        saveProduct("Data Structures & Algorithms", "Master classical computational arrays, sorting networks, trees, and complex graph maps.", "799.00", 150, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.9, 215);
        saveProduct("Designing Data-Intensive Applications", "The definitive master textbook on software architecture, storage engines, and scalability.", "1250.00", 130, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.9, 312);
        saveProduct("Quantitative Aptitude for Exams", "R.S. Aggarwal absolute reference guide for cracking banking and corporate aptitude tests.", "550.00", 200, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.4, 280);
        saveProduct("The Coding Interview Guide", "Essential patterns, dynamic programming, and visual system design breakdowns.", "499.00", 140, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.7, 98);
        saveProduct("Competitive Programming 4", "Advanced algorithmic handbook covering segment trees, math algorithms, and geometry.", "1100.00", 85, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.8, 42);
        saveProduct("AI Fundamentals & Ethics", "Comprehensive overview of artificial intelligence history, networks, and legalities.", "599.00", 70, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.3, 31);
        saveProduct("Hands-On Machine Learning", "Practical machine learning systems with Scikit-Learn, Keras, and TensorFlow.", "1499.00", 95, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.9, 167);
        saveProduct("Database Systems: Concepts", "Detailed foundational textbook on relational models, indexing, transactions, and SQL.", "999.00", 100, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", books, 4.5, 59);

        // ------------------------------------------
        // CATEGORY 9: SPORTS (10 Products)
        // ------------------------------------------
        saveProduct("MRF Genius Grand Cricket Bat", "Premium grade-1 English willow professional cricket bat with custom grip.", "18999.00", 15, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400", sports, 4.8, 38);
        saveProduct("Kookaburra Turf Leather Ball", "Hand-stitched premium four-piece leather match ball vital for multi-day play.", "2499.00", 90, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400", sports, 4.5, 47);
        saveProduct("Adidas Tango Football", "FIFA quality pro high-performance textured surface matches training football.", "3299.00", 80, "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400", sports, 4.6, 92);
        saveProduct("Spalding NBA Official Basketball", "Genuine composite leather indoor-outdoor grip structured basketball.", "2999.00", 75, "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400", sports, 4.7, 83);
        saveProduct("YONEX Astrox 99 Racket", "Professional high-grade graphite head-heavy powerful offensive badminton racket.", "14500.00", 20, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400", sports, 4.8, 54);
        saveProduct("Wilson Pro Staff Tennis Racket", "Precision carbon frame control oriented tournament standard tennis racket.", "16999.00", 15, "https://images.unsplash.com/photo-1622279457486-62dce4a431d6?w=400", sports, 4.7, 28);
        saveProduct("Decathlon Leather Gym Gloves", "Padded leather heavy lifting anti-slip wrist support gym gloves.", "999.00", 110, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400", sports, 4.2, 114);
        saveProduct("Sturdy Cast Iron Dumbbells (20kg)", "Pair of 10kg solid adjustable rubber-coated heavy cast iron dumbbells.", "3999.00", 40, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400", sports, 4.6, 125);
        saveProduct("Organic Premium Yoga Mat", "Extra thick eco-friendly non-slip active alignment sports yoga mat.", "1499.00", 130, "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400", sports, 4.5, 167);
        saveProduct("Nike Legend Training Shoes", "Durable flat-heel stability responsive training athletic shoes.", "5999.00", 65, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", sports, 4.6, 89);

        // ------------------------------------------
        // CATEGORY 10: BEAUTY & PERSONAL CARE (10 Products)
        // ------------------------------------------
        saveProduct("Himalaya Purifying Neem Face Wash", "Neem active cooling herbal formulation clearing pimples and control oils.", "199.00", 200, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", beautyPersonalCare, 4.3, 312);
        saveProduct("L'Oreal Professional Shampoo", "Enriched salicylic acid anti-hairfall structural defense intense shampoo.", "650.00", 140, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", beautyPersonalCare, 4.5, 185);
        saveProduct("Indulekha Bringha Hair Oil", "Proprietary ayurvedic medicine clinical hair loss treatment applicator oil.", "430.00", 160, "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400", beautyPersonalCare, 4.4, 142);
        saveProduct("Nivea Nourishing Body Lotion", "Deep moisture serum cocoa butter extracts 48hr dry skin defense cream.", "399.00", 180, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", beautyPersonalCare, 4.2, 220);
        saveProduct("Hugo Boss Bottled Perfume", "Luxury elegant woody masculine scent featuring warm spices vaporisateur spray.", "6900.00", 30, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", beautyPersonalCare, 4.8, 76);
        saveProduct("Philips Cordless Beard Trimmer", "Self-sharpening stainless steel active lock lengths settings trimmer device.", "2199.00", 95, "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400", beautyPersonalCare, 4.5, 189);
        saveProduct("Gillette Mach 3 Shaving Kit", "Includes durable triple-blade travel razor, comfort gel, and replacement cartridges.", "1299.00", 110, "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400", beautyPersonalCare, 4.4, 94);
        saveProduct("Neutrogena Hydro Lip Balm", "Hyaluronic acid instant moisturizing dry chapped lips protective balm.", "299.00", 150, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400", beautyPersonalCare, 4.1, 86);
        saveProduct("The Derma Co Skin Care Kit", "Includes active Vitamin C, salicylic face acids, and moisturizing cream.", "1499.00", 50, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", beautyPersonalCare, 4.5, 52);
        saveProduct("La Roche-Posay Sunscreen SPF50", "Ultra-light fluid fluid-absorbing oil-free high defense face sunscreen.", "2499.00", 75, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", beautyPersonalCare, 4.7, 104);

        // ------------------------------------------
        // CATEGORY 11: GAMING (10 Products)
        // ------------------------------------------
        saveProduct("Sony PlayStation 6", "Next-generation revolutionary gaming console with photorealistic graphics, SSD speed, and custom controller.", "59990.00", 15, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", gaming, 4.9, 86);
        saveProduct("Xbox Series X Pro", "Powerful console processing unit featuring native 120 FPS performance and Velocity architectures.", "49990.00", 20, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", gaming, 4.7, 43);
        saveProduct("Green Soul Mechanical Gaming Chair", "Ergonomic high-back synthetic leather executive reclining adjustable chair.", "14999.00", 25, "https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=400", gaming, 4.5, 59);
        saveProduct("Razer DeathAdder Gaming Mouse", "Ultra-light focus optical sensor ergonomic high sensitivity gaming mouse.", "3499.00", 90, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", gaming, 4.6, 114);
        saveProduct("SteelSeries Apex Pro Keyboard", "World fastest mechanical keyboard featuring adjustable omnipoint switches.", "18999.00", 18, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", gaming, 4.8, 37);
        saveProduct("HyperX Cloud II Headset", "Signature memory foam structural 7.1 virtual surround active gaming headset.", "7999.00", 80, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400", gaming, 4.7, 245);
        saveProduct("Acer Predator 240Hz Monitor", "IPS lightning-fast display with G-Sync compatibility and curved layout.", "28999.00", 15, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", gaming, 4.7, 34);
        saveProduct("Steam ₹5000 Gift Card", "Prepaid online digital currency wallet code valid across entire library.", "5000.00", 500, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", gaming, 4.8, 412);
        saveProduct("Sony DualSense Wireless Edge", "Premium customizable pro controller with adjustable triggers and back buttons.", "18990.00", 30, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", gaming, 4.8, 62);
        saveProduct("Meta Quest 3 VR Headset", "High-fidelity stand-alone mixed reality spatial computing active visual headset.", "49999.00", 10, "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400", gaming, 4.9, 56);

        System.out.println("=== 150 Products catalog successfully seeded! ===");
    }

    private void saveProduct(String name, String description, String price, int stock, String imageUrl, Category category, double rating, int reviews) {
        productRepository.save(Product.builder()
                .name(name)
                .description(description)
                .price(new BigDecimal(price))
                .stock(stock)
                .imageUrl(imageUrl)
                .category(category)
                .averageRating(rating)
                .reviewCount(reviews)
                .build());
    }

    private void initializeUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        User admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@ecommerce.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .blocked(false)
                .build());

        User user = userRepository.save(User.builder()
                .name("John Doe")
                .email("user@ecommerce.com")
                .password(passwordEncoder.encode("user123"))
                .phone("9876543210")
                .address("123 Main Street, Mumbai")
                .role(Role.USER)
                .blocked(false)
                .build());

        User vamsi = userRepository.save(User.builder()
                .name("Vamsi Ukkusuri")
                .email("vamsiukkusuri@gmail.com")
                .password(passwordEncoder.encode("vamsi123"))
                .phone("8885427136")
                .address("Hyderabad, India")
                .role(Role.ADMIN)
                .blocked(false)
                .build());

        cartRepository.save(Cart.builder().user(admin).build());
        cartRepository.save(Cart.builder().user(user).build());
        cartRepository.save(Cart.builder().user(vamsi).build());

        System.out.println("=== Users and Carts Initialized ===");
    }
}
