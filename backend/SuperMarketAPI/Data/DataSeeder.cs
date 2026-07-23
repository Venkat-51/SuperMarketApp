using SuperMarketAPI.Models;

namespace SuperMarketAPI.Data;

public static class DataSeeder
{
    public static void Seed(AppDbContext db)
    {
        // ── Categories ───────────────────────────────────────────────────────────
        if (!db.Categories.Any())
        {
            db.Categories.AddRange(
                new Category { Name = "Staples",          Icon = "🌾", SortOrder = 1 },
                new Category { Name = "Dairy & Breakfast", Icon = "🥛", SortOrder = 2 },
                new Category { Name = "Beverages",         Icon = "☕", SortOrder = 3 },
                new Category { Name = "Fruits & Veg",      Icon = "🥬", SortOrder = 4 },
                new Category { Name = "Snacks",            Icon = "🍿", SortOrder = 5 },
                new Category { Name = "Personal Care",     Icon = "🧴", SortOrder = 6 },
                new Category { Name = "Household",         Icon = "🧹", SortOrder = 7 }
            );
            db.SaveChanges();
        }

        // ── Products ─────────────────────────────────────────────────────────────
        if (!db.Products.Any())
        {
            db.Products.AddRange(
                // Staples (1–25)
                new Product { Name="Aashirvaad Svasti Pure Cow Ghee",        Brand="Aashirvaad",     ImageUrl="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", Price=690,  Mrp=740,  Weight="1 L",     Category="Staples",           InStock=true },
                new Product { Name="Fortune Premium Kachi Ghani Mustard Oil", Brand="Fortune",        ImageUrl="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", Price=175,  Mrp=195,  Weight="1 L",     Category="Staples",           InStock=true },
                new Product { Name="Saffola Gold Refined Cooking Oil",        Brand="Saffola",        ImageUrl="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", Price=165,  Mrp=185,  Weight="1 L",     Category="Staples",           InStock=true },
                new Product { Name="Tata Salt Iodized",                       Brand="Tata",           ImageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", Price=28,   Mrp=30,   Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Fortune Chakki Fresh Atta",               Brand="Fortune",        ImageUrl="https://images.unsplash.com/photo-1584868565640-7aa64a57c29a?w=400&q=80", Price=210,  Mrp=245,  Weight="5 kg",    Category="Staples",           InStock=true },
                new Product { Name="Aashirvaad Shudh Chakki Atta",            Brand="Aashirvaad",     ImageUrl="https://images.unsplash.com/photo-1584868565640-7aa64a57c29a?w=400&q=80", Price=415,  Mrp=460,  Weight="10 kg",   Category="Staples",           InStock=true },
                new Product { Name="India Gate Basmati Rice Super",           Brand="India Gate",     ImageUrl="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", Price=145,  Mrp=175,  Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Daawat Rozana Super Basmati Rice",        Brand="Daawat",         ImageUrl="https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80", Price=399,  Mrp=450,  Weight="5 kg",    Category="Staples",           InStock=true },
                new Product { Name="Tata Sampann Unpolished Toor Dal",        Brand="Tata Sampann",   ImageUrl="https://images.unsplash.com/photo-1612257998531-71e6ce54f78c?w=400&q=80", Price=185,  Mrp=210,  Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Tata Sampann Unpolished Chana Dal",       Brand="Tata Sampann",   ImageUrl="https://images.unsplash.com/photo-1612257998531-71e6ce54f78c?w=400&q=80", Price=110,  Mrp=130,  Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Organic Tattva Moong Dal Trust",          Brand="Organic Tattva", ImageUrl="https://images.unsplash.com/photo-1612257998531-71e6ce54f78c?w=400&q=80", Price=95,   Mrp=115,  Weight="500 g",   Category="Staples",           InStock=true },
                new Product { Name="Catch Turmeric Powder",                   Brand="Catch",          ImageUrl="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80", Price=55,   Mrp=65,   Weight="200 g",   Category="Staples",           InStock=true },
                new Product { Name="Catch Coriander Powder",                  Brand="Catch",          ImageUrl="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80", Price=60,   Mrp=72,   Weight="200 g",   Category="Staples",           InStock=true },
                new Product { Name="MDH Kashmiri Mirch Powder",               Brand="MDH",            ImageUrl="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80", Price=85,   Mrp=95,   Weight="100 g",   Category="Staples",           InStock=true },
                new Product { Name="Tata Sampann Garam Masala",               Brand="Tata Sampann",   ImageUrl="https://images.unsplash.com/photo-1506368249139-4d5c820f3a51?w=400&q=80", Price=78,   Mrp=90,   Weight="100 g",   Category="Staples",           InStock=true },
                new Product { Name="Madhur Pure Granulated Sugar",            Brand="Madhur",         ImageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", Price=52,   Mrp=60,   Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Tata Sampann Kabuli Chana",               Brand="Tata Sampann",   ImageUrl="https://images.unsplash.com/photo-1515543904253-7a3b4f614a6b?w=400&q=80", Price=88,   Mrp=105,  Weight="500 g",   Category="Staples",           InStock=true },
                new Product { Name="Rajdhani Besan",                          Brand="Rajdhani",       ImageUrl="https://images.unsplash.com/photo-1584868565640-7aa64a57c29a?w=400&q=80", Price=98,   Mrp=120,  Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Fortune Soya Chunks",                     Brand="Fortune",        ImageUrl="https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", Price=50,   Mrp=60,   Weight="200 g",   Category="Staples",           InStock=true },
                new Product { Name="Elite Roasted Vermicelli",                Brand="Elite",          ImageUrl="https://images.unsplash.com/photo-1621996659180-f97e571e3d51?w=400&q=80", Price=45,   Mrp=55,   Weight="400 g",   Category="Staples",           InStock=true },
                new Product { Name="MTR Poha / Avalakki Thick",               Brand="MTR",            ImageUrl="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", Price=55,   Mrp=68,   Weight="500 g",   Category="Staples",           InStock=true },
                new Product { Name="Catch Hing / Asafoetida",                 Brand="Catch",          ImageUrl="https://images.unsplash.com/photo-1506368249139-4d5c820f3a51?w=400&q=80", Price=65,   Mrp=75,   Weight="50 g",    Category="Staples",           InStock=true },
                new Product { Name="Tata Sampann Red Rajma",                  Brand="Tata Sampann",   ImageUrl="https://images.unsplash.com/photo-1548340748-6fe3b1d4e9b8?w=400&q=80", Price=92,   Mrp=110,  Weight="500 g",   Category="Staples",           InStock=true },
                new Product { Name="Organic Tattva Brown Rice",               Brand="Organic Tattva", ImageUrl="https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80", Price=130,  Mrp=160,  Weight="1 kg",    Category="Staples",           InStock=true },
                new Product { Name="Saffola Oats Natural",                    Brand="Saffola",        ImageUrl="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80", Price=185,  Mrp=225,  Weight="1 kg",    Category="Staples",           InStock=true },

                // Dairy & Breakfast (26–50)
                new Product { Name="Amul Taaza Fresh Toned Milk",             Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", Price=27,   Mrp=28,   Weight="500 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Gold Full Cream Milk",               Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", Price=33,   Mrp=34,   Weight="500 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Pasteurised Salted Butter",          Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80", Price=56,   Mrp=58,   Weight="100 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Pure Malai Paneer Block",            Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80", Price=92,   Mrp=100,  Weight="200 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Masti Spiced Buttermilk",            Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", Price=15,   Mrp=15,   Weight="200 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Mother Dairy Classic Dahi",               Brand="Mother Dairy",   ImageUrl="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80", Price=35,   Mrp=38,   Weight="400 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Britannia Premium Bake Rusk",             Brand="Britannia",      ImageUrl="https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80", Price=50,   Mrp=55,   Weight="300 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Britannia Sandwich Bread",                Brand="Britannia",      ImageUrl="https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80", Price=35,   Mrp=40,   Weight="400 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="English Oven Brown Bread",                Brand="English Oven",   ImageUrl="https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80", Price=45,   Mrp=50,   Weight="400 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Cheese Slices Multipack",            Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&q=80", Price=145,  Mrp=160,  Weight="200 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Hershey's Chocolate Syrup",               Brand="Hershey's",      ImageUrl="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80", Price=110,  Mrp=125,  Weight="200 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Kellogg's Corn Flakes Original",          Brand="Kellogg's",      ImageUrl="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80", Price=195,  Mrp=220,  Weight="475 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Quaker Instant Oats",                     Brand="Quaker",         ImageUrl="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80", Price=99,   Mrp=115,  Weight="400 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Kissan Mixed Fruit Jam",                  Brand="Kissan",         ImageUrl="https://images.unsplash.com/photo-1444489018268-1b8e13e3cf3b?w=400&q=80", Price=160,  Mrp=180,  Weight="500 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Noga Tomato Ketchup Classic",             Brand="Noga",           ImageUrl="https://images.unsplash.com/photo-1444489018268-1b8e13e3cf3b?w=400&q=80", Price=130,  Mrp=165,  Weight="1 kg",    Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Fresh Cream",                        Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", Price=64,   Mrp=68,   Weight="250 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="ID Fresh Idli Dosa Batter",               Brand="ID Fresh",       ImageUrl="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80", Price=75,   Mrp=90,   Weight="1 kg",    Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Mother Dairy Cow Ghee",                   Brand="Mother Dairy",   ImageUrl="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80", Price=345,  Mrp=375,  Weight="500 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Kwality Walls Vanilla Ice Cream",         Brand="Kwality Walls",  ImageUrl="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80", Price=120,  Mrp=150,  Weight="700 ml",  Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Amul Dark Chocolate Bar",                 Brand="Amul",           ImageUrl="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80", Price=120,  Mrp=125,  Weight="150 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Nestle A+ Slim Yogurt",                   Brand="Nestle",         ImageUrl="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80", Price=65,   Mrp=70,   Weight="400 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Yakult Probiotic Drink (5 Pack)",         Brand="Yakult",         ImageUrl="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", Price=90,   Mrp=95,   Weight="5 pcs",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Act II Butter Pepper Popcorn",            Brand="Act II",         ImageUrl="https://images.unsplash.com/photo-1587691592099-24045742c181?w=400&q=80", Price=20,   Mrp=25,   Weight="40 g",    Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="MTR Rava Idli Mix",                       Brand="MTR",            ImageUrl="https://images.unsplash.com/photo-1584868565640-7aa64a57c29a?w=400&q=80", Price=115,  Mrp=135,  Weight="500 g",   Category="Dairy & Breakfast",  InStock=true },
                new Product { Name="Bambino Macaroni Elbow Pasta",            Brand="Bambino",        ImageUrl="https://images.unsplash.com/photo-1621996659180-f97e571e3d51?w=400&q=80", Price=48,   Mrp=58,   Weight="500 g",   Category="Dairy & Breakfast",  InStock=true },

                // Beverages (51–75)
                new Product { Name="Tata Tea Premium Vibrant Blend",          Brand="Tata Tea",       ImageUrl="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80", Price=380,  Mrp=440,  Weight="1 kg",    Category="Beverages",          InStock=true },
                new Product { Name="Red Label Natural Care Tea",              Brand="Red Label",      ImageUrl="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80", Price=260,  Mrp=290,  Weight="500 g",   Category="Beverages",          InStock=true },
                new Product { Name="Taj Mahal Premium Leaf Tea",              Brand="Taj Mahal",      ImageUrl="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80", Price=175,  Mrp=195,  Weight="250 g",   Category="Beverages",          InStock=true },
                new Product { Name="Nescafe Classic Instant Coffee",          Brand="Nescafe",        ImageUrl="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80", Price=310,  Mrp=340,  Weight="100 g",   Category="Beverages",          InStock=true },
                new Product { Name="Bru Gold Instant Coffee",                 Brand="Bru",            ImageUrl="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80", Price=295,  Mrp=320,  Weight="100 g",   Category="Beverages",          InStock=true },
                new Product { Name="Bournvita Chocolate Health Drink",        Brand="Bournvita",      ImageUrl="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80", Price=240,  Mrp=265,  Weight="500 g",   Category="Beverages",          InStock=true },
                new Product { Name="Horlicks Classic Malt Drink",             Brand="Horlicks",       ImageUrl="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80", Price=255,  Mrp=280,  Weight="500 g",   Category="Beverages",          InStock=true },
                new Product { Name="Real Fruit Power Juice Mango",            Brand="Real",           ImageUrl="https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", Price=115,  Mrp=130,  Weight="1 L",     Category="Beverages",          InStock=true },
                new Product { Name="Tropicana 100% Orange Juice",             Brand="Tropicana",      ImageUrl="https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80", Price=135,  Mrp=150,  Weight="1 L",     Category="Beverages",          InStock=true },
                new Product { Name="Coca-Cola Aerated Soft Drink",            Brand="Coca-Cola",      ImageUrl="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80", Price=65,   Mrp=70,   Weight="1.25 L",  Category="Beverages",          InStock=true },
                new Product { Name="Thums Up Charged Soft Drink",             Brand="Thums Up",       ImageUrl="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80", Price=65,   Mrp=70,   Weight="1.25 L",  Category="Beverages",          InStock=true },
                new Product { Name="Sprite Lemon Lime Soft Drink",            Brand="Sprite",         ImageUrl="https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80", Price=45,   Mrp=50,   Weight="750 ml",  Category="Beverages",          InStock=true },
                new Product { Name="Bisleri Mineral Water Bottle",            Brand="Bisleri",        ImageUrl="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80", Price=20,   Mrp=20,   Weight="1 L",     Category="Beverages",          InStock=true },
                new Product { Name="Red Bull Energy Drink Can",               Brand="Red Bull",       ImageUrl="https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80", Price=120,  Mrp=125,  Weight="250 ml",  Category="Beverages",          InStock=true },
                new Product { Name="Paper Boat Aamras Juice Pack",            Brand="Paper Boat",     ImageUrl="https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", Price=35,   Mrp=40,   Weight="200 ml",  Category="Beverages",          InStock=true },
                new Product { Name="Tang Instant Orange Drink Powder",        Brand="Tang",           ImageUrl="https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80", Price=150,  Mrp=175,  Weight="500 g",   Category="Beverages",          InStock=true },
                new Product { Name="Glucon-D Instant Energy Nimbu",           Brand="Glucon-D",       ImageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", Price=165,  Mrp=185,  Weight="500 g",   Category="Beverages",          InStock=true },
                new Product { Name="Blue Tokai Roasted Coffee Beans",         Brand="Blue Tokai",     ImageUrl="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", Price=440,  Mrp=490,  Weight="250 g",   Category="Beverages",          InStock=true },
                new Product { Name="Society Masala Tea Loose Leaf",           Brand="Society",        ImageUrl="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80", Price=140,  Mrp=155,  Weight="250 g",   Category="Beverages",          InStock=true },
                new Product { Name="Lipton Pure Green Tea Bags",              Brand="Lipton",         ImageUrl="https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80", Price=145,  Mrp=165,  Weight="25 Pack", Category="Beverages",          InStock=true },
                new Product { Name="Paper Boat Anar Juice Premium",           Brand="Paper Boat",     ImageUrl="https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", Price=140,  Mrp=160,  Weight="1 L",     Category="Beverages",          InStock=true },
                new Product { Name="Fanta Orange Soft Drink",                 Brand="Fanta",          ImageUrl="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80", Price=95,   Mrp=100,  Weight="2 L",     Category="Beverages",          InStock=true },
                new Product { Name="Kinley Club Soda Extra Fizz",             Brand="Kinley",         ImageUrl="https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80", Price=30,   Mrp=35,   Weight="750 ml",  Category="Beverages",          InStock=true },
                new Product { Name="Sting Energy Drink Berry Blast",          Brand="Sting",          ImageUrl="https://images.unsplash.com/photo-1621873495884-845a939892d4?w=400&q=80", Price=20,   Mrp=20,   Weight="250 ml",  Category="Beverages",          InStock=true },
                new Product { Name="Nescafe Sunrise Chicory Blend",           Brand="Nescafe",        ImageUrl="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", Price=210,  Mrp=240,  Weight="200 g",   Category="Beverages",          InStock=true }
            );
            db.SaveChanges();
        }

        // ── Coupons ──────────────────────────────────────────────────────────────
        if (!db.Coupons.Any())
        {
            db.Coupons.AddRange(
                new Coupon { Code="SAVE50",    DiscountType=DiscountType.Flat,       DiscountValue=50,  MinOrder=299,  IsActive=true },
                new Coupon { Code="FLAT100",   DiscountType=DiscountType.Flat,       DiscountValue=100, MinOrder=599,  IsActive=true },
                new Coupon { Code="FIRST20",   DiscountType=DiscountType.Percentage, DiscountValue=20,  MinOrder=199,  MaxDiscount=150, IsActive=true },
                new Coupon { Code="SAISALE",   DiscountType=DiscountType.Percentage, DiscountValue=15,  MinOrder=499,  MaxDiscount=200, IsActive=true }
            );
            db.SaveChanges();
        }

        // ── Demo User ────────────────────────────────────────────────────────────
        if (!db.Users.Any())
        {
            db.Users.Add(new User
            {
                Name         = "Venkat Kumar",
                Phone        = "9999999999",
                Email        = "venkat@example.com",
                PasswordHash = Services.PasswordHasher.Hash("password123"),
            });
            db.SaveChanges();

            // Demo address for the demo user
            var user = db.Users.First();
            db.Addresses.Add(new Address
            {
                UserId    = user.Id,
                Label     = "Home",
                Line1     = "45, Anna Nagar West Extension",
                City      = "Chennai",
                State     = "Tamil Nadu",
                Pincode   = "600101",
                IsDefault = true,
            });
            db.SaveChanges();
        }
        else
        {
            // Backfill password for any existing users without a PasswordHash
            var usersWithoutPassword = db.Users.Where(u => string.IsNullOrEmpty(u.PasswordHash)).ToList();
            if (usersWithoutPassword.Any())
            {
                foreach (var u in usersWithoutPassword)
                {
                    u.PasswordHash = Services.PasswordHasher.Hash("password123");
                }
                db.SaveChanges();
            }
        }
    }
}
