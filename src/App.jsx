/**
 * THE PIANO BAR — Digital Ordering System
 * npm install @supabase/supabase-js bcryptjs @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBeer, faWineBottle, faChampagneGlasses, faBurger,faBottleDroplet,
    faLock, faLocationDot, faCircleCheck, faRotateRight,faWineGlassEmpty,faWhiskeyGlass,
    faRightFromBracket, faCircle, faClockRotateLeft, faPlus, faMinus,faBottleWater,
    faXmark, faArrowRight, faPaperPlane, faSpinner, faSlidersH, faNoteSticky,faMartiniGlassCitrus,
    faChevronDown, faChevronUp, faFilter, faCalendarDays, faTimesCircle,faShrimp,faWandMagicSparkles,
    faReceipt, faChevronRight, faListUl, faHourglassHalf, faCog, faCheckDouble,faPizzaSlice,
    faChevronLeft, faDrumstickBite, faTag,faBowlFood,faBacon,faFireFlameCurved,faBolt, faLeaf, faStar, faFish, faSeedling, faUtensils
} from "@fortawesome/free-solid-svg-icons";
import logo from "./assets/logo.svg";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ─────────────────────────── MENU DATA ── */
/*
  items can have an optional `variants` array:
  variants: [
    { label: "Small (6 pcs)", price: 80 },
    { label: "Large (12 pcs)", price: 120 },
  ]
  When variants exist, the item shows an inline size picker before Add.
  The `price` on the item itself is used only as a fallback display.
*/
const CATEGORIES = [
    {
        id: "massal",
        label: "Massal Bar",
        icon: faMartiniGlassCitrus,
        subcategories: [

            {
                id: "beers", label: "Beers", icon: faBeer, items: [
                    { id: "b1", name: "Heineken 330ml",  price: 35, description: "Dutch premium lager, 5% ABV",           customizable: false, options: [] },
                    { id: "b2", name: "Club Beer mini",  price: 18, description: "Ghana's favourite lager, small bottle",  customizable: false, options: [] },
                    { id: "b3", name: "Club Beer Large", price: 25, description: "Ghana's favourite lager, large bottle",  customizable: false, options: [] },
                    { id: "b4", name: "Guinness",        price: 18, description: "Rich Irish dry stout, creamy head",      customizable: false, options: [] },
                    { id: "b5", name: "Club Shandy",     price: 20, description: "Light lager blended with lemonade",      customizable: false, options: [] },
                    { id: "b6", name: "Origin Beer",     price: 20, description: "Crisp African-brewed lager",             customizable: false, options: [] },
                    { id: "b7", name: "Faxe/Kiss",       price: 28, description: "Strong Danish lager, 500ml can",         customizable: false, options: [] },
                ]
            },

            {
                id: "energy", label: "Coolers / Energy", icon: faBolt, items: [
                    { id: "e1", name: "Savanna",       price: 35, description: "South African dry cider, crisp & fruity",    customizable: false, options: [] },
                    { id: "e2", name: "Hunters",       price: 35, description: "Smooth South African apple cider",           customizable: false, options: [] },
                    { id: "e3", name: "Red Bull",      price: 35, description: "Energy drink with taurine & caffeine",       customizable: false, options: [] },
                    { id: "e4", name: "Smirnoff Ice",  price: 28, description: "Vodka-based lemon cooler, lightly sparkling", customizable: false, options: [] },
                    { id: "e5", name: "Vodi",          price: 28, description: "Chilled vodka-based cooler",                 customizable: false, options: [] },
                ]
            },

            {
                id: "whisky", label: "Whisky", icon: faWhiskeyGlass, items: [
                    { id: "wh1", name: "Red Label 20cl",   price: 130, description: "Johnnie Walker Red, blended Scotch whisky",   customizable: false, options: [] },
                    { id: "wh2", name: "Black Label 20cl", price: 250, description: "Johnnie Walker Black, 12-year aged Scotch",   customizable: false, options: [] },
                    { id: "wh3", name: "Smirnoff Vodka",   price: 90,  description: "Triple-distilled premium Russian vodka",      customizable: false, options: [] },
                ]
            },

            {
                id: "liqueur", label: "Liqueur", icon: faWineBottle, items: [
                    { id: "l1", name: "Campari 20cl",       price: 90,  description: "Italian bitter aperitif, vibrant red",        customizable: true, options: ["Neat", "On the rocks", "With water", "With soda"] },
                    { id: "l2", name: "Baileys 20cl",       price: 150, description: "Irish cream liqueur, rich & smooth",          customizable: true, options: ["Neat", "On the rocks", "With water", "With soda"] },
                    { id: "l3", name: "Jagermeister Shot",  price: 20,  description: "German herbal digestif, 56 botanicals",       customizable: true, options: ["Neat", "On the rocks", "With ginger ale"] },
                ]
            },

            {
                id: "wine", label: "Wine", icon: faWineGlassEmpty, items: [
                    { id: "w1", name: "Alcoholic Wine",     price: 140, description: "Chilled red or white, house selection",       customizable: false, options: [] },
                    { id: "w2", name: "Non-Alcoholic Wine", price: 80,  description: "Sparkling grape juice, chilled",              customizable: false, options: [] },
                ]
            },

            {
                id: "brandy", label: "Brandy / Cognac", icon: faWhiskeyGlass, items: [
                    { id: "bd1", name: "Hennessy VS 75cl",    price: 650,  description: "Very Special cognac, smooth & fruity",        customizable: false, options: [] },
                    { id: "bd2", name: "Hennessy VSOP 75cl",  price: 1700, description: "Very Superior Old Pale, aged 4–8 years",      customizable: false, options: [] },
                    { id: "bd3", name: "Hennessy VS 20cl",    price: 200,  description: "Very Special cognac, serving bottle",         customizable: false, options: [] },
                ]
            },

            {
                id: "champagne", label: "Champagne", icon: faChampagneGlasses, items: [
                    { id: "ch1", name: "Alcoholic Champagne",     price: 140, description: "Brut sparkling wine, chilled & crisp",      customizable: false, options: [] },
                    { id: "ch2", name: "Non-Alcoholic Champagne", price: 80,  description: "Sparkling grape, alcohol-free, chilled",    customizable: false, options: [] },
                ]
            },

            {
                id: "minerals", label: "Minerals", icon: faBottleDroplet, items: [
                    {
                        id: "m1", name: "Soft Drink", price: 15, description: "Chilled carbonated soft drink",
                        customizable: false, options: [],
                        variants: [
                            { label: "Fanta",  price: 15 },
                            { label: "Coke",   price: 15 },
                        ]
                    },
                    { id: "m2", name: "BB Cocktail", price: 18, description: "Chilled non-alcoholic cocktail mix",       customizable: false, options: [] },
                    {
                        id: "m3", name: "Malt", price: 15, description: "Non-alcoholic barley malt drink",
                        customizable: false, options: [],
                        variants: [
                            { label: "Malt Bottle", price: 15 },
                            { label: "Malt Can",    price: 20 },
                        ]
                    },
                    { id: "m4", name: "Alvaro",      price: 15, description: "Chilled non-alcoholic drink", customizable: false, options: [] },
                ]
            },

            {
                id: "water", label: "Water", icon: faBottleWater, items: [
                    { id: "wt1", name: "Still Water 500ml", price: 4, description: "Chilled purified still water",        customizable: false, options: [] },
                    { id: "wt2", name: "Still Water 750ml", price: 6, description: "Chilled purified still water, large", customizable: false, options: [] },
                ]
            },

            {
                id: "fruit", label: "Fruit Juice", icon: faSeedling, items: [
                    { id: "fj1", name: "Ceres (various)",  price: 50, description: "100% pure fruit juice, South African",  customizable: false, options: [] },
                    { id: "fj2", name: "Don Simon",        price: 45, description: "Spanish chilled fruit juice blend",      customizable: false, options: [] },
                ]
            },

            {
                id: "locals", label: "Locals", icon: faLeaf, items: [
                    { id: "lc1", name: "Kasapreko Alomo",  price: 7,  description: "Ghanaian herbal bitters, classic",        customizable: false, options: [] },
                    { id: "lc2", name: "Herb Afrik",       price: 7,  description: "Local herbal spirit blend",               customizable: false, options: [] },
                    { id: "lc3", name: "Castle Bridge",    price: 7,  description: "Smooth local spirit",                     customizable: false, options: [] },
                    { id: "lc4", name: "Orijin Bitters",   price: 7,  description: "African bitters with herbs & fruits",     customizable: false, options: [] },
                    { id: "lc5", name: "Madingo",          price: 7,  description: "Spiced local bitters",                    customizable: false, options: [] },
                    { id: "lc6", name: "Palm Wine",        price: 30, description: "Freshly tapped sweet palm sap",           customizable: false, options: [] },
                    { id: "lc7", name: "Sobolo",           price: 10, description: "Chilled hibiscus drink, lightly spiced",  customizable: false, options: [] },
                    { id: "lc8", name: "Pito",             price: 10, description: "Traditional fermented millet/sorghum",    customizable: false, options: [] },
                    { id: "lc9", name: "Kalahari",         price: 7,  description: "Local herbal tonic drink",                customizable: false, options: [] },
                ]
            },

        ],
    },

    {
        id: "food",
        label: "Food & Bites",
        icon: faBowlFood,
        subcategories: [

            {
                id: "goatDishes", label: "B37A – Goat Dishes", icon: faUtensils, items: [
                    { id: "P016", name: "Goat Stew", price: 95, description: "Tender goat slow-cooked in rich spiced stew", customizable: true, options: [], variants: [{ label: "P016", price: 95 }, { label: "P016A", price: 140 }] },
                    { id: "P017", name: "Goat Kebab Only", price: 95, description: "Grilled goat skewers, no side", customizable: false, options: [] },
                    { id: "P009", name: "Goat Jollof Rice Special", price: 95, description: "Jollof rice topped with seasoned goat, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P009", price: 95 }, { label: "P009A", price: 140 }] },
                    { id: "P008", name: "Goat Fried Rice Special", price: 95, description: "Wok-fried rice with seasoned goat, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P008", price: 95 }, { label: "P008A", price: 140 }] },
                    { id: "P020", name: "Goat Stir Fry Noodles", price: 95, description: "Wok-tossed noodles with tender goat pieces", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P020", price: 95 }, { label: "P020A", price: 140 }] },
                ]
            },

            {
                id: "gizzardDishes", label: "A15 – Gizzard Dishes", icon: faUtensils, items: [
                    { id: "P021", name: "Gizzard Stew", price: 80, description: "Braised chicken gizzard in spiced tomato stew", customizable: true, options: [], variants: [{ label: "P021", price: 80 }, { label: "P021A", price: 120 }] },
                    { id: "P022", name: "Gizzard Kebab Only", price: 40, description: "Grilled gizzard skewers, no side", customizable: false, options: [] },
                    { id: "P023", name: "Gizzard Jollof Rice Special", price: 80, description: "Jollof rice with grilled gizzard, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P023", price: 80 }, { label: "P023A", price: 120 }] },
                    { id: "P024", name: "Gizzard Fried Rice Special", price: 80, description: "Wok-fried rice with gizzard, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P024", price: 80 }, { label: "P024A", price: 120 }] },
                    { id: "P025", name: "Gizzard Stir Fry Noodles", price: 78, description: "Stir-fried noodles with seasoned gizzard", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P025", price: 78 }, { label: "P025A", price: 120 }] },
                ]
            },

            {
                id: "tilapia", label: "B27 – Tilapia", icon: faFish, items: [
                    { id: "P028", name: "Grilled Tilapia (550–700g)",   price: 95, description: "Whole grilled tilapia with seasoning & side", customizable: false, options: [] },
                    { id: "P029", name: "Grilled Tilapia (700–800g)",   price: 95, description: "Whole grilled tilapia, medium size",          customizable: false, options: [] },
                    { id: "P030", name: "Grilled Tilapia (800–900g)",   price: 95, description: "Whole grilled tilapia, large",                customizable: false, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"] },
                    { id: "P031", name: "Grilled Tilapia (900–1000g)",  price: 95, description: "Whole grilled tilapia, extra large",          customizable: false, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"] },
                    { id: "P032", name: "Grilled Tilapia (1000–1500g)", price: 95, description: "Whole grilled tilapia, jumbo size",           customizable: false, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"] },
                ]
            },

            {
                id: "snapper", label: "B27 – Red Snapper", icon: faFish, items: [
                    { id: "P034", name: "Fried Red Snapper",             price: 85, description: "Whole deep-fried red snapper, crispy skin",      customizable: false, options: [] },
                    { id: "P203", name: "Fried Red Snapper Only (1pc)",  price: 70, description: "Single deep-fried snapper fillet",               customizable: false, options: [] },
                    { id: "P035", name: "Fried Snapper with Veggie Stew", price: 95, description: "Crispy snapper served with garden vegetable stew", customizable: false, options: [] },
                    { id: "P036", name: "Red Snapper Soup",              price: 95, description: "Light pepper soup with whole red snapper",        customizable: false, options: [] },
                    { id: "PG36", name: "Red Snapper Groundnut Soup",    price: 95, description: "Creamy groundnut soup with red snapper",          customizable: false, options: [] },
                ]
            },

            {
                id: "tigerPrawns", label: "B80 – Tiger Prawns", icon: faShrimp, items: [
                    { id: "P040", name: "Prawns Veggie Stew", price: 180, description: "Tiger prawns in garden vegetable stew with side", customizable: true, options: [], variants: [{ label: "P040", price: 180 }, { label: "P040A", price: 200 }] },
                    { id: "P041", name: "Prawns Kebab (4pc)", price: 120, description: "Grilled tiger prawn skewers, no side", customizable: false, options: [] },
                    { id: "P042", name: "Grilled Prawns with Side Dish", price: 180, description: "Grilled tiger prawns with rice or chips, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P042", price: 180 }, { label: "P042A", price: 200 }] },
                    { id: "P006", name: "Prawn Fried Rice Special", price: 180, description: "Wok-fried rice loaded with tiger prawns", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P006", price: 180 }, { label: "P006A", price: 200 }] },
                ]
            },

            {
                id: "grouperDishes", label: "B70 – Grouper", icon: faFish, items: [
                    { id: "P044", name: "Grouper Veggie Stew",            price: 120, description: "Grilled grouper in rich garden vegetable stew",       customizable: false, options: [] },
                    { id: "P045", name: "Grouper Kebab Only",             price: 90,  description: "Grilled grouper skewers, no side dish",               customizable: false, options: [] },
                    { id: "P046", name: "Grilled Grouper with Side Dish", price: 120, description: "Whole grilled grouper served with rice or chips",      customizable: false, options: [] },
                    { id: "P047", name: "Grouper Veggie Sauce",           price: 120, description: "Grouper served in a light garden vegetable sauce",     customizable: false, options: [] },
                    { id: "P048", name: "Grouper Fried Rice Special",     price: 120, description: "Wok-fried rice with seasoned grouper",                 customizable: false, options: [] },
                    { id: "PG41", name: "Grouper Jollof Rice Special",    price: 120, description: "Jollof rice served with grilled grouper",              customizable: false, options: [] },
                    { id: "PG40", name: "Okro Stew Special",              price: 120, description: "Grouper in Ghanaian okro stew with side",              customizable: false, options: [] },
                ]
            },

            {
                id: "sausageDishes", label: "B60 – Sausage Dishes", icon: faBacon, items: [
                    { id: "P049", name: "Sausage Veggie Stew", price: 80, description: "Sliced sausage in spiced vegetable stew", customizable: true, options: [], variants: [{ label: "P049", price: 80 }, { label: "P049A", price: 120 }] },
                    { id: "P050", name: "Sausage Kebab (4pc)", price: 40, description: "Grilled sausage skewers, no side",        customizable: false, options: [] },
                    { id: "P051", name: "Sausage Jollof Rice Special", price: 80, description: "Jollof rice with grilled sausage, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P051", price: 80 }, { label: "P051A", price: 120 }] },
                    { id: "P052", name: "Sausage Fried Rice Special", price: 80, description: "Wok-fried rice with sliced sausage, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P052", price: 80 }, { label: "P052A", price: 120 }] },
                    { id: "P053", name: "Sausage Stir Fry Noodles", price: 78, description: "Stir-fried noodles tossed with seasoned sausage", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P053", price: 80 }, { label: "P053A", price: 120 }] },
                ]
            },

            {
                id: "beefDishes", label: "B24 – Beef Dishes", icon: faBurger, items: [
                    { id: "P054", name: "Beef Veggie Stew", price: 80, description: "Tender beef in rich spiced vegetable stew", customizable: true, options: [], variants: [{ label: "P054", price: 80 }, { label: "P054A", price: 120 }] },
                    { id: "P055", name: "Beef Kebab (4pc)", price: 40, description: "Grilled beef skewers, no side",             customizable: false, options: [] },
                    { id: "P056", name: "Beef Jollof Rice Special", price: 80, description: "Jollof rice served with seasoned beef, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P056", price: 80 }, { label: "P056A", price: 120 }] },
                    { id: "P057", name: "Beef Fried Rice Special", price: 80, description: "Wok-fried rice with tender beef, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P057", price: 80 }, { label: "P057A", price: 120 }] },
                    { id: "P058", name: "Beef Stir Fry Noodles", price: 80, description: "Stir-fried noodles with marinated beef strips", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P058", price: 80 }, { label: "P058A", price: 120 }] },
                ]
            },

            {
                id: "porkDishes", label: "B4 – Pork Dishes", icon: faBacon, items: [
                    { id: "P060", name: "Grilled Pork", price: 95, description: "Seasoned pork grilled over open flame", customizable: true, options: [], variants: [{ label: "P060", price: 95 }, { label: "P060A", price: 120 }] },
                    { id: "P061", name: "Pork Stir-Fry Noodles", price: 95, description: "Wok-tossed noodles with marinated pork strips", customizable: true, options: [], variants: [{ label: "P061", price: 95 }, { label: "P061A", price: 120 }] },
                    { id: "P062", name: "Pork Sauce", price: 95, description: "Pork in rich West African tomato & pepper sauce", customizable: true, options: [], variants: [{ label: "P062", price: 95 }, { label: "P062A", price: 120 }] },
                    { id: "P063", name: "Pork Stew", price: 95, description: "Slow-cooked pork in deep spiced stew", customizable: true, options: [], variants: [{ label: "P063", price: 95 }, { label: "P063A", price: 120 }] },
                    { id: "P064", name: "Pork Kebab / Skewer Only", price: 60, description: "Grilled pork skewers, no side dish", customizable: false, options: [] },
                    { id: "P010", name: "Pork Jollof Rice Special", price: 95, description: "Jollof rice topped with seasoned pork, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P010", price: 95 }, { label: "P010A", price: 120 }] },
                    { id: "P410", name: "Pork Fried Rice Special", price: 95, description: "Wok-fried rice with seasoned pork, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P410", price: 95 }, { label: "P410A", price: 120 }] },
                    { id: "P065", name: "Pork Stir Fry Noodles", price: 95, description: "Stir-fried noodles loaded with tender pork", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P065", price: 95 }, { label: "P065A", price: 120 }] },
                ]
            },

            {
                id: "chickenDishes", label: "B13 – Chicken Dishes", icon: faDrumstickBite, items: [
                    { id: "P070", name: "Grilled Chicken Drumsticks", price: 80, description: "Juicy grilled chicken drumsticks, well-seasoned", customizable: true, options: [], variants: [{ label: "P070", price: 80 }, { label: "P070A", price: 120 }] },
                    { id: "P071", name: "Grilled Chicken Wings", price: 80, description: "Crispy grilled wings with smoky char", customizable: true, options: [], variants: [{ label: "P071", price: 80 }, { label: "P071A", price: 120 }] },
                    { id: "P072", name: "Grilled Chicken Breast", price: 80, description: "Lean grilled breast fillet, lightly spiced", customizable: true, options: [], variants: [{ label: "P072", price: 80 }, { label: "P072A", price: 120 }] },
                    { id: "P073", name: "Chicken Veggie Sauce", price: 80, description: "Chicken in a light garden vegetable sauce", customizable: true, options: [], variants: [{ label: "P073", price: 80 }, { label: "P073A", price: 120 }] },
                    { id: "P074", name: "Chicken Veggie Stew", price: 80, description: "Chicken pieces slow-cooked in thick vegetable stew", customizable: true, options: [], variants: [{ label: "P074", price: 80 }, { label: "P074A", price: 120 }] },
                    { id: "P075", name: "Chicken Kebab / Skewer (3pcs)", price: 50, description: "Grilled chicken skewers, no side", customizable: false, options: [] },
                    { id: "P076", name: "Chicken Fried Rice Special", price: 80, description: "Wok-fried rice with seasoned chicken, choice of sauce", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P076", price: 80 }, { label: "P076A", price: 120 }] },
                    { id: "P212", name: "Grilled Drumsticks Only (3pcs)", price: 50, description: "Three grilled drumsticks with no side dish", customizable: false, options: [] },
                    { id: "P270", name: "Chicken Stir Fry Noodles", price: 80, description: "Stir-fried noodles tossed with tender chicken", customizable: true, options: ["BBQ", "Hot sauce", "Lemon pepper", "Peri-peri"], variants: [{ label: "P270", price: 80 }, { label: "P270A", price: 120 }] },
                ]
            },

            {
                id: "pizza", label: "Pizza", icon: faPizzaSlice, items: [
                    { id: "P090", name: "Seafood Pizza",                    price: 140, description: "Shrimp, fish & octopus on tomato base",          customizable: false, options: [] },
                    { id: "P091", name: "Beef Pizza",                       price: 120, description: "Seasoned beef strips on rich tomato sauce",       customizable: false, options: [] },
                    { id: "P092", name: "Chicken Pizza",                    price: 100, description: "Grilled chicken pieces on classic tomato base",   customizable: false, options: [] },
                    { id: "P093", name: "Special Chicken & Beef Pizza",     price: 120, description: "Loaded with both chicken and beef, house special", customizable: false, options: [] },
                    { id: "P094", name: "Sausage Pizza",                    price: 100, description: "Sliced sausage on tomato & cheese base",          customizable: false, options: [] },
                    { id: "P095", name: "Gizzard Pizza",                    price: 100, description: "Seasoned chicken gizzard on tomato base",         customizable: false, options: [] },
                    { id: "P096", name: "Pepperoni Pizza",                  price: 150, description: "Classic spicy pepperoni, Italian-style",          customizable: false, options: [] },
                    { id: "P097", name: "Tuna Pizza",                       price: 100, description: "Tuna flakes on tomato & cheese base",             customizable: false, options: [] },
                    { id: "P210", name: "Pork Pizza",                       price: 100, description: "Seasoned pork on classic tomato & cheese base",   customizable: false, options: [] },
                ]
            },

        ],
    },

    {
        id: "specials",
        label: "Specials",
        icon: faFireFlameCurved,
        subcategories: [

            {
                id: "pianoBarSpecial", label: "Piano Bar Specials", icon: faStar, items: [
                    { id: "P001", name: "Piano Assorted Fried Rice", price: 80, description: "House special fried rice with assorted meats", customizable: true, options: ["Chicken", "Beef", "Fried egg"], variants: [{ label: "P001", price: 80 }, { label: "P001A", price: 120 }] },
                    { id: "P002", name: "Piano Assorted Jollof", price: 80, description: "House special jollof rice with assorted meats", customizable: true, options: ["Chicken", "Beef", "Fried egg"], variants: [{ label: "P002", price: 80 }, { label: "P002A", price: 120 }] },
                    { id: "P220", name: "Piano Assorted Veg Sauce with Side", price: 90, description: "Assorted meats in vegetable sauce, served with a side", customizable: true, options: ["Chicken", "Beef"], variants: [{ label: "P220", price: 90 }, { label: "P220A", price: 130 }] },
                    { id: "P221", name: "Piano Assorted Veg Stew with Side", price: 90, description: "Assorted meats in thick vegetable stew, served with a side", customizable: true, options: ["Chicken", "Beef"], variants: [{ label: "P221", price: 90 }, { label: "P221A", price: 130 }] },
                    { id: "P012", name: "Piano Special Noodles (Beef & Chicken)", price: 80, description: "Stir-fried noodles loaded with beef and chicken", customizable: false, options: [], variants: [{ label: "P012", price: 80 }, { label: "P012A", price: 120 }] },
                    { id: "P052b", name: "Chicken Sausage Fried Rice Special", price: 80, description: "Fried rice with sliced chicken-type sausage", customizable: true, options: [], variants: [{ label: "P052", price: 80 }, { label: "P052A", price: 100 }] },
                    { id: "P222", name: "Chicken Breast & Sausage Fried Rice Mix", price: 80, description: "Fried rice with chicken breast and sausage blend", customizable: false, options: [] },
                    { id: "P223", name: "Chicken Breast & Sausage Jollof Rice Mix", price: 80, description: "Jollof rice with chicken breast and sausage blend", customizable: false, options: [] },
                    { id: "P051b", name: "Chicken Sausage Jollof Rice Special", price: 80, description: "Jollof rice with seasoned chicken sausage", customizable: false, options: [], variants: [{ label: "P051", price: 80 }, { label: "P051A", price: 130 }] },
                    { id: "P053b", name: "Chicken Sausage Stir Fry Noodles", price: 80, description: "Stir-fried noodles with chicken sausage", customizable: false, options: [], variants: [{ label: "P053", price: 80 }, { label: "P053A", price: 130 }] },
                ]
            },

            {
                id: "seaFoodSpecial", label: "Seafood Specials", icon: faShrimp, items: [
                    { id: "P003", name: "Seafood Special Fried Rice", price: 100, description: "Wok-fried rice with mixed seafood, choice of protein", customizable: true, options: ["Shrimps", "Octopus", "Fish"], variants: [{ label: "P003", price: 100 }, { label: "P003A", price: 130 }] },
                    { id: "P004", name: "Seafood Special Jollof Rice", price: 100, description: "Jollof rice loaded with mixed seafood, choice of protein", customizable: true, options: ["Shrimps", "Octopus", "Fish"], variants: [{ label: "P004", price: 100 }, { label: "P004A", price: 130 }] },
                    { id: "P005", name: "Seafood Stir Fry Noodles", price: 100, description: "Stir-fried noodles with mixed seafood, choice of protein", customizable: true, options: ["Shrimps", "Octopus", "Fish"], variants: [{ label: "P005", price: 100 }, { label: "P005A", price: 130 }] },
                ]
            },

            {
                id: "prawnSpecial", label: "Prawn Specials", icon: faShrimp, items: [
                    { id: "P006b", name: "Tiger Prawns Fried Rice", price: 150, description: "Wok-fried rice piled with whole tiger prawns", customizable: false, options: [], variants: [{ label: "P006", price: 150 }, { label: "P006A", price: 170 }] },
                    { id: "P007",  name: "Tiger Prawns Jollof Rice", price: 150, description: "Smoky jollof rice served with whole tiger prawns", customizable: false, options: [], variants: [{ label: "P007", price: 150 }, { label: "P007A", price: 170 }] },
                    { id: "P201",  name: "Tiger Prawn Noodles", price: 150, description: "Stir-fried noodles with whole tiger prawns", customizable: false, options: [], variants: [{ label: "P201", price: 150 }, { label: "P201A", price: 170 }] },
                ]
            },

            {
                id: "goatSpecial", label: "Goat Specials", icon: faFireFlameCurved, items: [
                    { id: "P008b", name: "Piano Goat Fried Rice Special", price: 95, description: "House special fried rice with seasoned goat", customizable: false, options: [], variants: [{ label: "P008", price: 95 }, { label: "P008A", price: 140 }] },
                    { id: "P009b", name: "Piano Goat Jollof Rice Special", price: 95, description: "House special jollof rice with seasoned goat", customizable: false, options: [], variants: [{ label: "P009", price: 95 }, { label: "P009A", price: 140 }] },
                ]
            },

            {
                id: "porkSpecial", label: "Pork Specials", icon: faBacon, items: [
                    { id: "P010b", name: "Piano Pork Fried Rice Special", price: 95, description: "House special fried rice with seasoned pork", customizable: false, options: [], variants: [{ label: "P010", price: 95 }, { label: "P010A", price: 140 }] },
                    { id: "P011",  name: "Piano Pork Jollof Rice Special", price: 95, description: "House special jollof rice with seasoned pork", customizable: false, options: [], variants: [{ label: "P011", price: 95 }, { label: "P011A", price: 140 }] },
                ]
            },

            {
                id: "ghanaianSpecial", label: "Ghanaian Specials", icon: faBowlFood, items: [
                    { id: "P430", name: "Light Soup", price: 95, description: "Spiced clear broth — choose your protein", customizable: false, options: [], variants: [
                            { label: "P430 – 3pc Goat",       price: 95  },
                            { label: "P431 – 2pc Dry Fish",   price: 120 },
                            { label: "P432 – 2pc Tuna/Salmon", price: 90 },
                            { label: "P433 – Chicken Thigh",  price: 90  },
                            { label: "P434 – 2–4pc Beef",     price: 90  },
                        ]},
                    { id: "P435", name: "Groundnut Soup", price: 95, description: "Rich creamy peanut soup — choose your protein", customizable: false, options: [], variants: [
                            { label: "P435 – 3pc Goat",        price: 95  },
                            { label: "P436 – 2pc Dry Fish",    price: 120 },
                            { label: "P437 – Tuna/Salmon",     price: 90  },
                            { label: "P438 – Chicken Thigh",   price: 90  },
                            { label: "P439 – 2–4pc Beef",      price: 90  },
                        ]},
                    { id: "P102", name: "Okro Stew Mix",     price: 85, description: "Okro stew with beef, fish, crabs & wele", customizable: true, options: [] },
                    { id: "P440", name: "Okro Stew (Goat)",  price: 95, description: "Traditional okro stew with 3 pieces of goat", customizable: true, options: [] },
                    { id: "P208", name: "Okro Stew (Pork)",  price: 95, description: "Traditional okro stew with seasoned pork", customizable: false, options: [], variants: [{ label: "P208", price: 95 }, { label: "P208A", price: 130 }] },
                    { id: "P103", name: "Palava Sauce (Kontomire, Tuna & Egg)", price: 85, description: "Ghanaian cocoyam leaf stew with tuna and boiled egg", customizable: true, options: ["Yam", "Plantain", "Rice"], variants: [{ label: "P103", price: 85 }, { label: "P103A", price: 130 }] },
                    { id: "P104", name: "Tilapia Light Soup", price: 120, description: "Spiced light soup with whole fresh tilapia", customizable: false, options: [] },
                    { id: "P101", name: "Light Soup Mixed",   price: 85,  description: "Spiced clear broth with mixed assorted proteins", customizable: false, options: [] },
                ]
            },

        ],
    },

    {
        id: "extras",
        label: "Extras",
        icon: faWandMagicSparkles,
        subcategories: [

            {
                id: "extras", label: "Extras", icon: faTag, items: [
                    { id: "P419", name: "Extra Salmon",   price: 30, description: "Add a salmon portion to your dish",    customizable: false, options: [] },
                    { id: "P420", name: "Extra Tuna",     price: 30, description: "Add a tuna portion to your dish",      customizable: false, options: [] },
                    { id: "P421", name: "Extra Dry Fish", price: 30, description: "Add dried fish to your dish",          customizable: false, options: [] },
                    { id: "P422", name: "Extra Beef",     price: 30, description: "Add a beef portion to your dish",      customizable: false, options: [] },
                    { id: "P423", name: "Extra Goat",     price: 30, description: "Add a goat portion to your dish",      customizable: false, options: [] },
                ]
            },

            {
                id: "packs", label: "The Happy Chicken Packs", icon: faDrumstickBite, items: [
                    { id: "P080", name: "Happy Chicken Drumsticks 6/Pk",             price: 90,  description: "6 grilled chicken drumsticks, party pack",              customizable: false, options: [] },
                    { id: "P081", name: "Happy Chicken Drumsticks 12/Pk",            price: 160, description: "12 grilled chicken drumsticks, sharing pack",            customizable: false, options: [] },
                    { id: "P082", name: "Happy Chicken Drumsticks 15/Pk",            price: 190, description: "15 grilled chicken drumsticks, large sharing pack",      customizable: false, options: [] },
                    { id: "P083", name: "Happy Chicken Drumsticks 20/Pk",            price: 250, description: "20 grilled chicken drumsticks, crowd pack",              customizable: false, options: [] },
                    { id: "P084", name: "Happy Chicken Wings 5/Pk + 500g Yam Chips", price: 120, description: "5 grilled wings served with crispy yam chips",           customizable: false, options: [] },
                    { id: "P085", name: "Happy Chicken Wings 12/Pk",                price: 170, description: "12 grilled chicken wings, sharing pack",                 customizable: false, options: [] },
                    { id: "P086", name: "Happy Chicken Wings 20/Pk",                price: 250, description: "20 grilled chicken wings, crowd pack",                   customizable: false, options: [] },
                ]
            },

        ],
    },
];

/* ─────────────────────────── STATUS CONFIG ──────────────────────── */
const STATUS_COLOR   = { Pending:"#b45309", Preparing:"#1d4ed8", Ready:"#15803d", Delivered:"#6b7280" };
const STATUS_BG      = { Pending:"#fef3c7", Preparing:"#dbeafe", Ready:"#dcfce7", Delivered:"#f3f4f6" };
const STATUS_DARK_BG = { Pending:"#451a03", Preparing:"#1e3a5f", Ready:"#14532d", Delivered:"#1f2937" };
const STATUS_NEXT    = { Pending:"Preparing", Preparing:"Ready", Ready:"Delivered" };
const STATUS_LABEL   = { Pending:"Start preparing", Preparing:"Mark ready", Ready:"Mark delivered" };
const STATUS_ICON    = { Pending:faHourglassHalf, Preparing:faCog, Ready:faCheckDouble };
const STATUSES       = ["Pending","Preparing","Ready","Delivered"];

const STAT_CARDS = [
    { label:"All",       color:"#c9a84c", status: null },
    { label:"Pending",   color:"#f59e0b", status:"Pending" },
    { label:"Preparing", color:"#60a5fa", status:"Preparing" },
    { label:"Ready",     color:"#4ade80", status:"Ready" },
];

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

/* ─────────────────────────── TOAST HOOK ────────────────────────── */
let _tid = 0;
function useToasts() {
    const [toasts, setToasts] = useState([]);
    const add = (msg, type = "success") => {
        const id = ++_tid;
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
    return { toasts, add };
}

/* ─────────────────────── ORDER DETAIL MODAL ────────────────────── */
function OrderDetailModal({ order, onClose, onUpdateStatus }) {
    if (!order) return null;
    const currentIdx = STATUSES.indexOf(order.status);
    return (
        <div onClick={e => e.target === e.currentTarget && onClose()}
             style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:700,
                 display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
            <div style={{ background:"#1a1625", border:"1px solid #3a2a5e", borderRadius:20,
                width:"100%", maxWidth:460, maxHeight:"92vh", overflowY:"auto" }}>

                <div style={{ padding:"18px 18px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <FontAwesomeIcon icon={faReceipt} style={{ color:"#c9a84c", fontSize:15 }} />
                            <span style={{ fontWeight:700, fontSize:16, color:"#f5f0e8" }}>Order #{String(order.id).slice(-5).toUpperCase()}</span>
                        </div>
                        <div style={{ color:"#7a6a90", fontSize:12, lineHeight:1.6 }}>
                            Table <strong style={{ color:"#c9a84c" }}>{order.table_no}</strong>
                            {" · "}{order.guest_name}
                            <br />
                            {new Date(order.created_at).toLocaleString([], { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                        </div>
                    </div>
                    <button onClick={onClose}
                            style={{ background:"#2e2050", border:"none", color:"#a78bfa", borderRadius:8,
                                padding:"8px 11px", cursor:"pointer", fontSize:15, flexShrink:0 }}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div style={{ padding:"10px 18px 0" }}>
                    <span style={{ padding:"5px 14px", borderRadius:20, fontSize:13, fontWeight:700,
                        color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
                        {order.status}
                    </span>
                </div>

                <div style={{ padding:"16px 18px 0" }}>
                    <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Progress</div>
                    <div style={{ display:"flex", alignItems:"center" }}>
                        {STATUSES.map((s, i) => {
                            const done  = i <= currentIdx;
                            const active = i === currentIdx;
                            return (
                                <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STATUSES.length-1 ? 1 : "none" }}>
                                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                                        <div style={{
                                            width:28, height:28, borderRadius:"50%",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            background: active ? STATUS_BG[s] : done ? STATUS_DARK_BG[s] : "#1a1020",
                                            border:`2px solid ${active ? STATUS_COLOR[s] : done ? STATUS_COLOR[s]+"80" : "#2e2050"}`,
                                            boxShadow: active ? `0 0 0 3px ${STATUS_COLOR[s]}30` : "none",
                                        }}>
                                            {done
                                                ? <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize:12, color:STATUS_COLOR[s] }} />
                                                : <span style={{ fontSize:10, color:"#4a3a60", fontWeight:700 }}>{i+1}</span>}
                                        </div>
                                        <span style={{ fontSize:8, color: done ? "#f5f0e8" : "#4a3a60", whiteSpace:"nowrap" }}>{s}</span>
                                    </div>
                                    {i < STATUSES.length-1 && (
                                        <div style={{ flex:1, height:2, marginBottom:14, marginLeft:3, marginRight:3,
                                            background: i < currentIdx ? "linear-gradient(90deg,#7c3aed,#5b21b6)" : "#2e2050" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ margin:"16px 18px 0", background:"#13111e", borderRadius:14, padding:14 }}>
                    <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Items ordered</div>
                    {order.items.map((item, i) => (
                        <div key={i} style={{ marginBottom:10, paddingBottom:10,
                            borderBottom: i < order.items.length-1 ? "1px solid #2e2050" : "none" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600, gap:8 }}>
                                <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>{item.name} × {item.qty}</span>
                                <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                            </div>
                            {item.variant && (
                                <div style={{ fontSize:12, color:"#c9a84c90", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                                    <FontAwesomeIcon icon={faTag} style={{ fontSize:9 }} /> {item.variant}
                                </div>
                            )}
                            {item.opts?.length > 0 && (
                                <div style={{ fontSize:12, color:"#a78bfa", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                                    <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> {item.opts.join(", ")}
                                </div>
                            )}
                            {item.note && (
                                <div style={{ fontSize:12, color:"#7a6a90", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                                    <FontAwesomeIcon icon={faNoteSticky} style={{ fontSize:9 }} /> {item.note}
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:16,
                        paddingTop:10, borderTop:"1px solid #2e2050" }}>
                        <span style={{ color:"#7a6a90" }}>Total</span>
                        <span style={{ color:"#c9a84c" }}>GHC {order.total}</span>
                    </div>
                </div>

                <div style={{ padding:"14px 18px" }}>
                    {STATUS_NEXT[order.status] ? (
                        <button onClick={() => { onUpdateStatus(order.id, STATUS_NEXT[order.status]); onClose(); }}
                                style={{ width:"100%", padding:14, borderRadius:12, border:"none", cursor:"pointer",
                                    fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                                    color:STATUS_COLOR[STATUS_NEXT[order.status]],
                                    background:STATUS_BG[STATUS_NEXT[order.status]] }}>
                            <FontAwesomeIcon icon={STATUS_ICON[order.status]} />
                            {STATUS_LABEL[order.status]}
                        </button>
                    ) : (
                        <div style={{ textAlign:"center", color:"#4a3a60", fontSize:13, padding:"4px 0" }}>
                            <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight:6, color:"#15803d" }} />
                            Order completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────── CUSTOMER ORDERS PAGE ───────────────────── */
function CustomerOrdersPage({ tableNo }) {
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(t);
    }, []);

    const load = useCallback(async () => {
        if (!tableNo.trim()) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from("orders").select("*")
            .eq("table_no", tableNo.trim())
            .order("created_at", { ascending: false })
            .limit(30);
        if (!error && data) setMyOrders(data);
        setLoading(false);
    }, [tableNo]);

    useEffect(() => {
        load();
        if (!tableNo.trim()) return;
        const channel = supabase.channel("my-orders-live")
            .on("postgres_changes", { event:"UPDATE", schema:"public", table:"orders" }, p => {
                if (p.new.table_no === tableNo.trim())
                    setMyOrders(prev => prev.map(o => o.id === p.new.id ? p.new : o));
            })
            .on("postgres_changes", { event:"INSERT", schema:"public", table:"orders" }, p => {
                if (p.new.table_no === tableNo.trim())
                    setMyOrders(prev => [p.new, ...prev]);
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [load, tableNo]);

    if (!tableNo.trim()) return (
        <div style={{ maxWidth:520, margin:"0 auto", padding:"60px 20px", textAlign:"center" }}>
            <FontAwesomeIcon icon={faListUl} style={{ fontSize:44, color:"#2e2050", marginBottom:16 }} />
            <p style={{ color:"#4a3a60", fontSize:15 }}>Enter your table number on the Menu tab to track your orders.</p>
        </div>
    );

    if (loading) return (
        <div style={{ textAlign:"center", padding:60, color:"#4a3a60" }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize:28, display:"block", margin:"0 auto 12px" }} />
            Loading your orders…
        </div>
    );

    const visible = myOrders.filter(o => {
        if (o.status !== "Delivered") return true;
        const updated = new Date(o.updated_at || o.created_at);
        return (now - updated.getTime()) < THREE_HOURS_MS;
    });

    if (!visible.length) return (
        <div style={{ maxWidth:520, margin:"0 auto", padding:"60px 20px", textAlign:"center" }}>
            <FontAwesomeIcon icon={faReceipt} style={{ fontSize:44, color:"#2e2050", marginBottom:16 }} />
            <p style={{ color:"#4a3a60", fontSize:15 }}>No current orders for Table {tableNo}.</p>
            <p style={{ color:"#3a2a5e", fontSize:13 }}>Head to the Menu tab and place an order.</p>
        </div>
    );

    return (
        <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 12px 60px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ color:"#7c3aed" }} />
                <span style={{ color:"#a78bfa", fontSize:14 }}>
                    Table <strong style={{ color:"#c9a84c" }}>{tableNo}</strong>
                    {" · "}{visible.length} order{visible.length !== 1 ? "s" : ""}
                </span>
                <button onClick={load}
                        style={{ marginLeft:"auto", background:"transparent", border:"1px solid #2e2050",
                            color:"#7a6a90", borderRadius:20, padding:"5px 12px", cursor:"pointer",
                            fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                    <FontAwesomeIcon icon={faRotateRight} /> Refresh
                </button>
            </div>

            {visible.map(order => {
                const expanded   = expandedId === order.id;
                const currentIdx = STATUSES.indexOf(order.status);
                const isReady    = order.status === "Ready";
                return (
                    <div key={order.id} style={{
                        background:"#1a1625",
                        border:`1px solid ${isReady ? "#15803d80" : "#2e2050"}`,
                        borderRadius:16, marginBottom:12, overflow:"hidden",
                        boxShadow: isReady ? "0 0 0 1px #15803d30, 0 4px 20px #15803d18" : "none",
                    }}>
                        {isReady && (
                            <div style={{ background:"#14532d", padding:"9px 14px",
                                display:"flex", alignItems:"center", gap:8,
                                fontSize:13, fontWeight:600, color:"#4ade80" }}>
                                <FontAwesomeIcon icon={faCircleCheck} /> Your order is ready — come collect it!
                            </div>
                        )}

                        <div onClick={() => setExpandedId(expanded ? null : order.id)}
                             style={{ padding:"14px 14px 10px", cursor:"pointer",
                                 display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                            <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:12, color:"#7a6a90", marginBottom:4 }}>
                                    {new Date(order.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                                    {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                </div>
                                <div style={{ fontWeight:700, color:"#c9a84c", fontSize:17 }}>GHC {order.total}</div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                                <span style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                                    color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
                                    {order.status}
                                </span>
                                <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} style={{ color:"#4a3a60", fontSize:11 }} />
                            </div>
                        </div>

                        <div style={{ padding:"0 14px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center" }}>
                                {STATUSES.map((s, i) => {
                                    const done   = i <= currentIdx;
                                    const active = i === currentIdx;
                                    return (
                                        <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STATUSES.length-1 ? 1 : "none" }}>
                                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                                                <div style={{
                                                    width: active ? 24 : 18, height: active ? 24 : 18, borderRadius:"50%",
                                                    background: active ? STATUS_BG[s] : done ? STATUS_DARK_BG[s] : "#1a1020",
                                                    border:`2px solid ${active ? STATUS_COLOR[s] : done ? STATUS_COLOR[s]+"80" : "#2e2050"}`,
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                    transition:"all 0.25s",
                                                    boxShadow: active ? `0 0 0 3px ${STATUS_COLOR[s]}25` : "none",
                                                }}>
                                                    {done && <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: active ? 11 : 8, color:STATUS_COLOR[s] }} />}
                                                </div>
                                                <span style={{ fontSize:8, color: done ? "#a09abf" : "#3a2a5e", whiteSpace:"nowrap" }}>{s}</span>
                                            </div>
                                            {i < STATUSES.length-1 && (
                                                <div style={{ flex:1, height:2, marginBottom:14, marginLeft:3, marginRight:3,
                                                    background: i < currentIdx
                                                        ? `linear-gradient(90deg,${STATUS_COLOR[STATUSES[i]]},${STATUS_COLOR[STATUSES[i+1]]})`
                                                        : "#2e2050",
                                                    transition:"background 0.3s" }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {expanded && (
                            <div style={{ borderTop:"1px solid #2e2050", padding:"12px 14px" }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{ marginBottom:10 }}>
                                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600, gap:8 }}>
                                            <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name} × {item.qty}</span>
                                            <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                                        </div>
                                        {item.variant && (
                                            <div style={{ fontSize:12, color:"#c9a84c90", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                                                <FontAwesomeIcon icon={faTag} style={{ fontSize:9 }} /> {item.variant}
                                            </div>
                                        )}
                                        {item.opts?.length > 0 && (
                                            <div style={{ fontSize:12, color:"#a78bfa", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                                                <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> {item.opts.join(", ")}
                                            </div>
                                        )}
                                        {item.note && (
                                            <div style={{ fontSize:12, color:"#7a6a90", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                                                <FontAwesomeIcon icon={faNoteSticky} style={{ fontSize:9 }} /> {item.note}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════ MAIN APP ══════════════════════════════ */
export default function App() {
    const [scene, setScene]       = useState("customer");
    const [menuView, setMenuView] = useState("categories");
    const [activeCategoryId, setActiveCategoryId]   = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);

    const [cart, setCart]     = useState([]);
    const [orders, setOrders] = useState([]);
    const [tableNo, setTableNo] = useState(() => {
        try { return new URLSearchParams(window.location.search).get("table") || ""; }
        catch { return ""; }
    });
    const [guestName, setGuestName] = useState("");

    // customize modal (handles both variants + options)
    const [customizeItem, setCustomizeItem] = useState(null);
    const [chosenVariant, setChosenVariant] = useState(null);   // { label, price }
    const [chosenOpts, setChosenOpts]       = useState([]);
    const [itemNote, setItemNote]           = useState("");

    const [pin, setPin]               = useState("");
    const [pinErr, setPinErr]         = useState("");
    const [pinLoading, setPinLoading] = useState(false);
    const [staffUser, setStaffUser]   = useState(null);

    const [bartenderTab, setBartenderTab]   = useState("live");
    const [statusFilter, setStatusFilter]   = useState(null);
    const [submitting, setSubmitting]       = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [historyDateFrom, setHistoryDateFrom] = useState("");
    const [historyDateTo,   setHistoryDateTo]   = useState("");
    const [showFilters, setShowFilters]         = useState(false);
    const [historySearch, setHistorySearch]     = useState("");

    const { toasts, add: addToast } = useToasts();

    /* ── open customize/variant modal ── */
    const openCustomize = (item) => {
        setCustomizeItem(item);
        // pre-select first variant if item has them
        setChosenVariant(item.variants ? item.variants[0] : null);
        setChosenOpts([]);
        setItemNote("");
    };

    /* ── category navigation ── */
    const openCategory = (cat) => {
        setActiveCategoryId(cat.id);
        setActiveSubcategory(cat.subcategories[0].id);
        setMenuView("subcategory");
    };
    const goBackToCategories = () => {
        setMenuView("categories");
        setActiveCategoryId(null);
    };
    const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId);

    /* ── fetch & realtime ── */
    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending:false });
        if (!error && data) setOrders(data);
        setLoadingOrders(false);
    }, []);

    useEffect(() => {
        if (scene !== "bartender") return;
        let cancelled = false;
        (async () => {
            setLoadingOrders(true);
            const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending:false });
            if (!cancelled && !error && data) setOrders(data);
            if (!cancelled) setLoadingOrders(false);
        })();
        const ch = supabase.channel("orders-live")
            .on("postgres_changes", { event:"INSERT", schema:"public", table:"orders" },
                p => setOrders(prev => [p.new, ...prev]))
            .on("postgres_changes", { event:"UPDATE", schema:"public", table:"orders" },
                p => {
                    setOrders(prev => prev.map(o => o.id === p.new.id ? p.new : o));
                    setSelectedOrder(sel => sel?.id === p.new.id ? p.new : sel);
                })
            .on("postgres_changes", { event:"DELETE", schema:"public", table:"orders" },
                p => setOrders(prev => prev.filter(o => o.id !== p.old.id)))
            .subscribe(s => console.log("Realtime:", s));
        return () => { cancelled = true; supabase.removeChannel(ch); };
    }, [scene]);

    /* ── cart helpers ── */
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    const addToCart = (item, opts = [], note = "", variant = null) => {
        // effective price: variant price if chosen, else item default price
        const effectivePrice = variant ? variant.price : item.price;
        const variantLabel   = variant ? variant.label : null;
        setCart(prev => {
            // key includes variant label so different variants are separate cart lines
            const key = item.id + (variantLabel || "") + opts.join(",");
            const ex  = prev.find(c => c._key === key);
            if (ex) return prev.map(c => c._key === key ? { ...c, qty: c.qty+1 } : c);
            return [...prev, {
                ...item,
                price: effectivePrice,
                variant: variantLabel,
                qty: 1, opts, note,
                _key: key,
            }];
        });
    };

    const changeQty = (key, delta) =>
        setCart(prev =>
            prev.map(c => c._key === key ? { ...c, qty: c.qty+delta } : c).filter(c => c.qty > 0)
        );

    /* ── submit order ── */
    const submitOrder = async () => {
        if (!tableNo.trim()) { addToast("Please enter your table number.", "error"); return; }
        if (!cart.length)    { addToast("Your cart is empty.", "error"); return; }
        setSubmitting(true);
        const { error } = await supabase.from("orders").insert({
            table_no:   tableNo.trim(),
            guest_name: guestName.trim() || "Guest",
            items: cart.map(({ id, name, price, qty, opts, note, variant }) => ({ id, name, price, qty, opts, note, variant })),
            total: cartTotal, status:"Pending",
        });
        if (error) { addToast("Failed to send order. Try again.", "error"); }
        else { setCart([]); setGuestName(""); addToast("Order sent! We'll get right on it."); setScene("orders"); }
        setSubmitting(false);
    };

    /* ── PIN login ── */
    const tryPin = async () => {
        if (!pin.trim()) return;
        setPinLoading(true); setPinErr("");
        const { data: staffList, error } = await supabase
            .from("staff").select("id, name, role, pin_hash").eq("active", true);
        if (error || !staffList?.length) { setPinErr("Could not reach server."); setPinLoading(false); return; }
        let matched = null;
        for (const s of staffList) { if (await bcrypt.compare(pin, s.pin_hash)) { matched = s; break; } }
        if (matched) { setStaffUser(matched); setScene("bartender"); setPin(""); }
        else setPinErr("Wrong PIN. Please try again.");
        setPinLoading(false);
    };

    /* ── update status ── */
    const updateStatus = async (id, status) => {
        const { error } = await supabase.from("orders").update({ status }).eq("id", id);
        if (error) addToast("Failed to update status.", "error");
    };

    /* ── derived lists ── */
    const liveOrders   = orders.filter(o => o.status !== "Delivered");
    const filteredLive = statusFilter ? liveOrders.filter(o => o.status === statusFilter) : liveOrders;

    const historyOrders = orders.filter(o => {
        if (o.status !== "Delivered") return false;
        const d = new Date(o.created_at);
        if (historyDateFrom) { const f = new Date(historyDateFrom); f.setHours(0,0,0,0); if (d < f) return false; }
        if (historyDateTo)   { const t = new Date(historyDateTo);   t.setHours(23,59,59,999); if (d > t) return false; }
        if (historySearch.trim()) {
            const q = historySearch.trim().toLowerCase();
            if (
                !o.table_no?.toLowerCase().includes(q) &&
                !o.guest_name?.toLowerCase().includes(q) &&
                !o.items?.some(i => i.name?.toLowerCase().includes(q)) &&
                !String(o.total).includes(q)
            ) return false;
        }
        return true;
    });
    const historyTotal = historyOrders.reduce((s, o) => s + Number(o.total), 0);
    const pendingCount = orders.filter(o => o.status === "Pending").length;
    const hasDateFilter = historyDateFrom || historyDateTo;
    const displayList   = bartenderTab === "live" ? filteredLive : historyOrders;

    /* ════════════════════ ITEM CARD (reused in subcategory view) ════════════════════ */
    const ItemCard = ({ item }) => {
        const hasVariants = item.variants?.length > 0;
        const needsModal  = hasVariants || item.customizable;

        // for non-modal items, find a matching cart entry
        const inCart = !needsModal ? cart.find(c => c._key === item.id + "" + (item.opts?.join(",") || "")) : null;

        return (
            <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:14,
                padding:"14px", marginBottom:10, display:"flex", flexDirection:"column", gap:10 }}>

                {/* Top row: info + action */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:15, marginBottom:2,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {item.name}
                        </div>
                        <div style={{ fontSize:12, color:"#7a6a90", marginBottom:6,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {item.description}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                            {hasVariants ? (
                                <span style={{ color:"#c9a84c", fontWeight:600, fontSize:14 }}>
                                    From GHC {Math.min(...item.variants.map(v => v.price))}
                                </span>
                            ) : (
                                <span style={{ color:"#c9a84c", fontWeight:600, fontSize:15 }}>GHC {item.price}</span>
                            )}
                            {hasVariants && (
                                <span style={{ fontSize:10, background:"#c9a84c18", color:"#c9a84c",
                                    padding:"2px 8px", borderRadius:10,
                                    display:"inline-flex", alignItems:"center", gap:4, border:"1px solid #c9a84c40" }}>
                                    <FontAwesomeIcon icon={faTag} style={{ fontSize:9 }} /> sizes
                                </span>
                            )}
                            {item.customizable && (
                                <span style={{ fontSize:10, background:"#2e2050", color:"#a78bfa",
                                    padding:"2px 8px", borderRadius:10,
                                    display:"inline-flex", alignItems:"center", gap:4 }}>
                                    <FontAwesomeIcon icon={faSlidersH} style={{ fontSize:9 }} /> custom
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ flexShrink:0 }}>
                        {needsModal ? (
                            <button onClick={() => openCustomize(item)}
                                    style={{ padding:"9px 14px", borderRadius:10,
                                        background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                                        color:"#fff", border:"none", cursor:"pointer",
                                        fontSize:13, fontWeight:600,
                                        display:"flex", alignItems:"center", gap:5 }}>
                                <FontAwesomeIcon icon={faPlus} /> Add
                            </button>
                        ) : inCart ? (
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <QtyBtn onClick={() => changeQty(inCart._key, -1)}><FontAwesomeIcon icon={faMinus} /></QtyBtn>
                                <span style={{ color:"#c9a84c", fontWeight:700, minWidth:22, textAlign:"center", fontSize:15 }}>{inCart.qty}</span>
                                <QtyBtn accent onClick={() => addToCart(item)}><FontAwesomeIcon icon={faPlus} /></QtyBtn>
                            </div>
                        ) : (
                            <button onClick={() => addToCart(item)}
                                    style={{ padding:"9px 14px", borderRadius:10,
                                        background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                                        color:"#fff", border:"none", cursor:"pointer",
                                        fontSize:13, fontWeight:600,
                                        display:"flex", alignItems:"center", gap:5 }}>
                                <FontAwesomeIcon icon={faPlus} /> Add
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* ════════════════════════════ RENDER ══════════════════════════════ */
    return (
        <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", background:"#0c0c10", minHeight:"100vh", color:"#f5f0e8" }}>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                html, body { margin:0; padding:0; overscroll-behavior:none; -webkit-tap-highlight-color:transparent; }
                input, textarea {
                    background:#1a1625 !important; border:1px solid #2e2050 !important;
                    color:#f5f0e8 !important; border-radius:10px !important; outline:none !important;
                    font-size:16px !important; font-family:inherit !important;
                    -webkit-appearance:none; appearance:none;
                }
                input:focus, textarea:focus { border-color:#7c3aed !important; }
                input::placeholder, textarea::placeholder { color:#6b6080 !important; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
                ::-webkit-scrollbar { display:none; }
                button { -webkit-tap-highlight-color:transparent; touch-action:manipulation; font-family:inherit; }
                @keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.7); } }
                .live-dot { animation:blink 1.2s ease-in-out infinite; }
                .ocard { transition:border-color 0.15s, transform 0.1s; cursor:pointer; }
                .ocard:active { transform:scale(0.985); }
                .stat-card { transition:border-color 0.15s, transform 0.1s, box-shadow 0.15s; cursor:pointer; }
                .stat-card:active { transform:scale(0.96); }
                .cat-card { transition:border-color 0.15s, transform 0.12s, box-shadow 0.15s; cursor:pointer; }
                .cat-card:active { transform:scale(0.96); }
                .input-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
                @media (max-width: 520px) { .input-row { grid-template-columns:1fr; } }
            `}</style>

            {/* ── Toasts ── */}
            <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)",
                zIndex:9999, display:"flex", flexDirection:"column", gap:8,
                alignItems:"center", pointerEvents:"none",
                width:"calc(100vw - 32px)", maxWidth:400 }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: t.type === "error" ? "#450a0a" : "#052e16",
                        border:`1px solid ${t.type === "error" ? "#dc2626" : "#16a34a"}`,
                        color: t.type === "error" ? "#fca5a5" : "#86efac",
                        padding:"12px 20px", borderRadius:12, fontSize:14,
                        boxShadow:"0 4px 24px rgba(0,0,0,0.7)", pointerEvents:"auto",
                        textAlign:"center", width:"100%",
                    }}>{t.msg}</div>
                ))}
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />

            {/* ════════ NAV ════════ */}
            <nav style={{
                background:"#13111e", borderBottom:"1px solid #1e1a35",
                padding:"10px 14px", display:"flex", alignItems:"center",
                justifyContent:"space-between", position:"sticky", top:0, zIndex:200,
            }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1 }}>
                    <img src={logo} alt="Logo"
                         style={{ height:38, width:38, objectFit:"contain", borderRadius:8, flexShrink:0 }} />
                    <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#c9a84c", letterSpacing:1,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            THE PIANO BAR
                        </div>
                        <div style={{ fontSize:9, color:"#6b5a90", letterSpacing:2, marginTop:1 }}>SCAN · ORDER · RELAX</div>
                    </div>
                </div>
                <div style={{ display:"flex", gap:5, flexShrink:0, marginLeft:8 }}>
                    <NavBtn label="Menu" active={scene==="customer"} onClick={() => { setScene("customer"); setMenuView("categories"); }} />
                    <NavBtn label="Orders" active={scene==="orders"} onClick={() => setScene("orders")} />
                    <NavBtn
                        label={staffUser ? staffUser.name.split(" ")[0] : "Staff"}
                        active={scene==="bartender"}
                        badge={pendingCount}
                        onClick={() => scene==="bartender" ? setScene("customer") : setScene("pin")}
                    />
                </div>
            </nav>

            {/* ════════ PIN ════════ */}
            {scene === "pin" && (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center",
                    minHeight:"calc(100vh - 62px)", padding:20 }}>
                    <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:20,
                        padding:"36px 24px", width:"100%", maxWidth:340, textAlign:"center" }}>
                        <FontAwesomeIcon icon={faLock} style={{ fontSize:36, color:"#c9a84c", marginBottom:14 }} />
                        <h2 style={{ color:"#c9a84c", marginBottom:6, fontWeight:600, fontSize:20, margin:"0 0 6px" }}>Staff access</h2>
                        <p style={{ color:"#7a6a90", fontSize:13, marginBottom:22 }}>Enter your PIN to continue</p>
                        <input type="password" value={pin} inputMode="numeric"
                               onChange={e => { setPin(e.target.value); setPinErr(""); }}
                               onKeyDown={e => e.key==="Enter" && tryPin()}
                               placeholder="••••"
                               style={{ width:"100%", padding:"14px 0", textAlign:"center", letterSpacing:12, marginBottom:8 }} />
                        {pinErr && <p style={{ color:"#f87171", fontSize:13, marginBottom:8 }}>{pinErr}</p>}
                        <p style={{ color:"#4a3a60", fontSize:11, marginBottom:18 }}>Each staff member has their own PIN</p>
                        <button onClick={tryPin} disabled={pinLoading}
                                style={{ width:"100%", padding:14, borderRadius:12,
                                    background: pinLoading ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                                    color: pinLoading ? "#7a6a90" : "#fff", border:"none",
                                    cursor: pinLoading ? "wait" : "pointer",
                                    fontSize:15, fontWeight:600,
                                    display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            {pinLoading
                                ? <><FontAwesomeIcon icon={faSpinner} spin /> Verifying…</>
                                : <><FontAwesomeIcon icon={faArrowRight} /> Enter dashboard</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ════════ CUSTOMER MENU ════════ */}
            {scene === "customer" && (
                <div style={{ maxWidth:580, margin:"0 auto", padding:"16px 12px 200px" }}>

                    <div className="input-row">
                        <input type="text" placeholder="Your name (optional)" value={guestName}
                               onChange={e => setGuestName(e.target.value)} style={{ padding:"12px", width:"100%" }} />
                        <input type="text" placeholder="Table number *" value={tableNo}
                               inputMode="numeric" onChange={e => setTableNo(e.target.value)} style={{ padding:"12px", width:"100%" }} />
                    </div>

                    {tableNo && (
                        <div style={{ background:"#1a1a2e", border:"1px solid #7c3aed40", borderRadius:10,
                            padding:"9px 14px", marginBottom:14, fontSize:13, color:"#a78bfa",
                            display:"flex", alignItems:"center", gap:8 }}>
                            <FontAwesomeIcon icon={faLocationDot} style={{ color:"#7c3aed", flexShrink:0 }} />
                            Ordering for <strong style={{ color:"#c9a84c" }}>Table {tableNo}</strong>
                        </div>
                    )}

                    {/* ══ CATEGORY GRID ══ */}
                    {menuView === "categories" && (
                        <>
                            <div style={{ fontSize:10, color:"#6b6080", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
                                Choose a category
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                                {CATEGORIES.map(cat => {
                                    const itemCount = cat.subcategories.reduce((s, sub) => s + sub.items.length, 0);
                                    return (
                                        <div key={cat.id} className="cat-card" onClick={() => openCategory(cat)}
                                             style={{ background:"#1a1625", border:"1.5px solid #2e2050",
                                                 borderRadius:16, padding:"20px 14px",
                                                 display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:10 }}>
                                            <div style={{ width:52, height:52, borderRadius:"50%",
                                                background:"#13111e", border:"1.5px solid #2e2050",
                                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                <FontAwesomeIcon icon={cat.icon} style={{ fontSize:22, color:"#c9a84c" }} />
                                            </div>
                                            <div style={{ fontSize:14, fontWeight:700, color:"#f5f0e8", lineHeight:1.3 }}>{cat.label}</div>
                                            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                                                <span style={{ fontSize:11, color:"#7a6a90" }}>{cat.subcategories.length} section{cat.subcategories.length !== 1 ? "s" : ""}</span>
                                                <span style={{ fontSize:10, color:"#3a2a5e" }}>·</span>
                                                <span style={{ fontSize:11, color:"#7a6a90" }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                                            </div>
                                            <div style={{ marginTop:2, display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#a78bfa", fontWeight:600 }}>
                                                View menu <FontAwesomeIcon icon={faChevronRight} style={{ fontSize:10 }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {tableNo && (
                                <button onClick={() => setScene("orders")}
                                        style={{ width:"100%", marginTop:4, padding:"13px", borderRadius:14,
                                            background:"transparent", border:"1px solid #2e2050", color:"#7a6a90",
                                            cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                                    <FontAwesomeIcon icon={faListUl} /> View my orders
                                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize:11 }} />
                                </button>
                            )}
                        </>
                    )}

                    {/* ══ SUBCATEGORY / ITEMS VIEW ══ */}
                    {menuView === "subcategory" && activeCategory && (
                        <>
                            {/* Back header */}
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                                <button onClick={goBackToCategories}
                                        style={{ background:"#1a1625", border:"1px solid #2e2050",
                                            borderRadius:10, padding:"8px 12px", cursor:"pointer",
                                            color:"#a78bfa", fontSize:13, display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                                    <FontAwesomeIcon icon={faChevronLeft} /> Back
                                </button>
                                <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                                    <div style={{ width:34, height:34, borderRadius:"50%",
                                        background:"#13111e", border:"1px solid #2e2050",
                                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                        <FontAwesomeIcon icon={activeCategory.icon} style={{ fontSize:15, color:"#c9a84c" }} />
                                    </div>
                                    <div style={{ minWidth:0 }}>
                                        <div style={{ fontWeight:700, fontSize:16, color:"#f5f0e8",
                                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                            {activeCategory.label}
                                        </div>
                                        <div style={{ fontSize:11, color:"#7a6a90", marginTop:1 }}>
                                            {activeCategory.subcategories.length} section{activeCategory.subcategories.length !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subcategory pill tabs */}
                            {activeCategory.subcategories.length > 1 && (
                                <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:6,
                                    marginBottom:16, WebkitOverflowScrolling:"touch" }}>
                                    {activeCategory.subcategories.map(sub => {
                                        const isSub = activeSubcategory === sub.id;
                                        return (
                                            <button key={sub.id} onClick={() => setActiveSubcategory(sub.id)}
                                                    style={{ padding:"8px 14px", borderRadius:20, border:"1px solid",
                                                        whiteSpace:"nowrap", cursor:"pointer", fontSize:13,
                                                        display:"flex", alignItems:"center", gap:6, flexShrink:0,
                                                        borderColor: isSub ? "#c9a84c" : "#2e2050",
                                                        background:  isSub ? "#c9a84c18" : "transparent",
                                                        color:       isSub ? "#c9a84c" : "#7a6a90" }}>
                                                <FontAwesomeIcon icon={sub.icon} /><span>{sub.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {activeCategory.subcategories
                                .filter(sub => activeCategory.subcategories.length === 1 || sub.id === activeSubcategory)
                                .map(sub => (
                                    <div key={sub.id}>
                                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, marginTop:4 }}>
                                            <div style={{ width:28, height:28, borderRadius:8,
                                                background:"#13111e", border:"1px solid #2e2050",
                                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                                                <FontAwesomeIcon icon={sub.icon} style={{ fontSize:12, color:"#a78bfa" }} />
                                            </div>
                                            <span style={{ fontWeight:700, fontSize:14, color:"#a78bfa" }}>{sub.label}</span>
                                            <span style={{ fontSize:11, color:"#3a2a5e", marginLeft:2 }}>({sub.items.length})</span>
                                        </div>

                                        {sub.items.map(item => <ItemCard key={item.id} item={item} />)}

                                        {activeCategory.subcategories.length > 1 && (
                                            <div style={{ height:1, background:"#1e1a35", margin:"6px 0 18px" }} />
                                        )}
                                    </div>
                                ))}
                        </>
                    )}
                </div>
            )}

            {/* ════════ FLOATING CART BAR ════════ */}
            {scene === "customer" && cartCount > 0 && (
                <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#13111e",
                    borderTop:"1px solid #2e2050", padding:"10px 14px", zIndex:150,
                    paddingBottom:"max(10px, env(safe-area-inset-bottom))" }}>
                    <div style={{ maxWidth:580, margin:"0 auto" }}>
                        <div style={{ marginBottom:8, maxHeight:90, overflowY:"auto" }}>
                            {cart.map(item => (
                                <div key={item._key}
                                     style={{ display:"flex", justifyContent:"space-between", fontSize:13,
                                         color:"#a09abf", marginBottom:4, alignItems:"center", gap:8 }}>
                                    <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                        {item.name}
                                        {item.variant ? ` · ${item.variant}` : ""}
                                        {item.opts?.length ? ` (${item.opts.join(", ")})` : ""}
                                        {" "}× {item.qty}
                                    </span>
                                    <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                                        <span style={{ color:"#c9a84c", fontSize:13 }}>GHC {item.price * item.qty}</span>
                                        <QtyBtn small onClick={() => changeQty(item._key, -1)}><FontAwesomeIcon icon={faMinus} /></QtyBtn>
                                        <QtyBtn small accent onClick={() => changeQty(item._key, 1)}><FontAwesomeIcon icon={faPlus} /></QtyBtn>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                            <div>
                                <span style={{ color:"#7a6a90", fontSize:12 }}>{cartCount} item{cartCount!==1?"s":""} · </span>
                                <span style={{ color:"#c9a84c", fontWeight:700, fontSize:16 }}>GHC {cartTotal}</span>
                            </div>
                            <button onClick={submitOrder} disabled={submitting}
                                    style={{ padding:"12px 20px", borderRadius:12,
                                        background: submitting ? "#2e2050" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                                        color: submitting ? "#7a6a90" : "#fff", border:"none",
                                        cursor: submitting ? "wait" : "pointer",
                                        fontSize:14, fontWeight:700,
                                        display:"flex", alignItems:"center", gap:7, flexShrink:0, whiteSpace:"nowrap" }}>
                                {submitting
                                    ? <><FontAwesomeIcon icon={faSpinner} spin /> Sending…</>
                                    : <><FontAwesomeIcon icon={faPaperPlane} /> Send order</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ CUSTOMIZE / VARIANT MODAL ════════ */}
            {customizeItem && (
                <div onClick={e => e.target===e.currentTarget && setCustomizeItem(null)}
                     style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:500,
                         display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
                    <div style={{ background:"#1a1625", border:"1px solid #2e2050",
                        borderRadius:"20px 20px 0 0", padding:"20px 16px",
                        width:"100%", maxWidth:580, maxHeight:"88vh", overflowY:"auto",
                        paddingBottom:"max(20px, env(safe-area-inset-bottom))" }}>

                        {/* Header */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                            <div>
                                <div style={{ fontWeight:700, fontSize:17 }}>{customizeItem.name}</div>
                                <div style={{ color:"#c9a84c", fontWeight:600, marginTop:2, fontSize:15 }}>
                                    GHC {chosenVariant ? chosenVariant.price : customizeItem.price}
                                </div>
                            </div>
                            <button onClick={() => setCustomizeItem(null)}
                                    style={{ background:"#2e2050", border:"none", color:"#a78bfa",
                                        borderRadius:8, padding:"8px 12px", cursor:"pointer", fontSize:16 }}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        {/* ── VARIANT SELECTOR (size/portion picker) ── */}
                        {customizeItem.variants?.length > 0 && (
                            <div style={{ marginBottom:18 }}>
                                <p style={{ color:"#7a6a90", fontSize:13, marginBottom:10,
                                    display:"flex", alignItems:"center", gap:6 }}>
                                    <FontAwesomeIcon icon={faTag} /> Choose your size
                                </p>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                    {customizeItem.variants.map(v => {
                                        const sel = chosenVariant?.label === v.label;
                                        return (
                                            <button key={v.label}
                                                    onClick={() => setChosenVariant(v)}
                                                    style={{
                                                        padding:"12px 18px", borderRadius:12, cursor:"pointer",
                                                        border:`2px solid ${sel ? "#c9a84c" : "#2e2050"}`,
                                                        background: sel ? "#c9a84c18" : "#13111e",
                                                        display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                                                        minWidth:100, flex:1,
                                                    }}>
                                                <span style={{ fontSize:14, fontWeight:700,
                                                    color: sel ? "#c9a84c" : "#f5f0e8" }}>
                                                    {v.label}
                                                </span>
                                                <span style={{ fontSize:13, color: sel ? "#c9a84c" : "#7a6a90" }}>
                                                    GHC {v.price}
                                                </span>
                                                {sel && (
                                                    <FontAwesomeIcon icon={faCircleCheck}
                                                                     style={{ fontSize:12, color:"#c9a84c", marginTop:2 }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── CUSTOMIZATION OPTIONS ── */}
                        {customizeItem.customizable && customizeItem.options.length > 0 && (
                            <>
                                <p style={{ color:"#7a6a90", fontSize:13, marginBottom:10,
                                    display:"flex", alignItems:"center", gap:6 }}>
                                    <FontAwesomeIcon icon={faSlidersH} /> Choose your preferences
                                </p>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                                    {customizeItem.options.map(opt => {
                                        const sel = chosenOpts.includes(opt);
                                        return (
                                            <button key={opt}
                                                    onClick={() => setChosenOpts(p => sel ? p.filter(o => o!==opt) : [...p, opt])}
                                                    style={{ padding:"9px 14px", borderRadius:20, border:"1px solid", cursor:"pointer",
                                                        fontSize:13, display:"inline-flex", alignItems:"center", gap:6,
                                                        borderColor: sel ? "#c9a84c" : "#2e2050",
                                                        background:  sel ? "#c9a84c20" : "transparent",
                                                        color:       sel ? "#c9a84c" : "#a09abf" }}>
                                                {sel && <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize:11 }} />}{opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── SPECIAL INSTRUCTIONS ── */}
                        <div style={{ position:"relative", marginBottom:14 }}>
                            <FontAwesomeIcon icon={faNoteSticky}
                                             style={{ position:"absolute", top:13, left:12, color:"#4a3a60", fontSize:13, pointerEvents:"none" }} />
                            <textarea value={itemNote} onChange={e => setItemNote(e.target.value)}
                                      placeholder="Special instructions? (optional)"
                                      style={{ width:"100%", padding:"11px 12px 11px 32px", borderRadius:10, resize:"none", height:70 }} />
                        </div>

                        <button
                            onClick={() => {
                                addToCart(customizeItem, chosenOpts, itemNote, chosenVariant);
                                setCustomizeItem(null);
                                const variantStr = chosenVariant ? ` · ${chosenVariant.label}` : "";
                                addToast(`${customizeItem.name}${variantStr} added`);
                            }}
                            style={{ width:"100%", padding:14, borderRadius:12,
                                background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                                color:"#fff", border:"none", cursor:"pointer",
                                fontSize:15, fontWeight:700,
                                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                            <FontAwesomeIcon icon={faPlus} /> Add to order
                            {chosenVariant && (
                                <span style={{ fontSize:13, opacity:0.85, fontWeight:400 }}>
                                    — GHC {chosenVariant.price}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ════════ CUSTOMER ORDERS ════════ */}
            {scene === "orders" && <CustomerOrdersPage tableNo={tableNo} />}

            {/* ════════ BARTENDER DASHBOARD ════════ */}
            {scene === "bartender" && (
                <div style={{ maxWidth:860, margin:"0 auto", padding:"16px 12px 48px" }}>

                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        marginBottom:16, flexWrap:"wrap", gap:10 }}>
                        <div>
                            <h2 style={{ margin:0, color:"#c9a84c", fontSize:20 }}>Live Dashboard</h2>
                            {staffUser && (
                                <p style={{ margin:"3px 0 0", color:"#7a6a90", fontSize:12 }}>
                                    Logged in as <strong style={{ color:"#a78bfa" }}>{staffUser.name}</strong> · {staffUser.role}
                                </p>
                            )}
                        </div>
                        <button onClick={() => { setStaffUser(null); setScene("customer"); }}
                                style={{ padding:"8px 14px", borderRadius:20, border:"1px solid #2e2050",
                                    background:"transparent", color:"#7a6a90", cursor:"pointer",
                                    fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                            <FontAwesomeIcon icon={faRightFromBracket} /> Log out
                        </button>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
                        {STAT_CARDS.map(sc => {
                            const count = sc.status
                                ? orders.filter(o => o.status === sc.status).length
                                : liveOrders.length;
                            const isActive = bartenderTab === "live" && statusFilter === sc.status;
                            return (
                                <div key={sc.label} className="stat-card"
                                     onClick={() => {
                                         setBartenderTab("live");
                                         setStatusFilter(prev => (prev === sc.status && sc.status !== null) ? null : sc.status);
                                     }}
                                     style={{ background: isActive ? "#1e1030" : "#1a1625",
                                         border:`1px solid ${isActive ? sc.color : "#2e2050"}`,
                                         borderRadius:12, padding:"12px 6px", textAlign:"center",
                                         boxShadow: isActive ? `0 0 0 2px ${sc.color}30` : "none" }}>
                                    <div style={{ fontSize:22, fontWeight:700, color:sc.color }}>{count}</div>
                                    <div style={{ fontSize:10, color:"#6b6080", marginTop:2 }}>{sc.label}</div>
                                    {isActive && <div style={{ fontSize:9, color:sc.color, marginTop:3, letterSpacing:0.5 }}>▲ filtered</div>}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
                        {[
                            { key:"live",    label:"Live",    icon:faCircle,          count:liveOrders.length },
                            { key:"history", label:"History", icon:faClockRotateLeft, count:historyOrders.length },
                        ].map(t => (
                            <button key={t.key}
                                    onClick={() => { setBartenderTab(t.key); if (t.key === "history") setStatusFilter(null); }}
                                    style={{ padding:"8px 16px", borderRadius:20, border:"1px solid", cursor:"pointer",
                                        fontSize:13, display:"flex", alignItems:"center", gap:6,
                                        borderColor: bartenderTab===t.key ? "#c9a84c" : "#2e2050",
                                        background:  bartenderTab===t.key ? "#c9a84c18" : "transparent",
                                        color:       bartenderTab===t.key ? "#c9a84c" : "#7a6a90" }}>
                                <FontAwesomeIcon icon={t.icon}
                                                 className={t.key==="live" ? "live-dot" : ""}
                                                 style={{ fontSize: t.key==="live" ? 8 : 12,
                                                     color: t.key==="live" ? "#ef4444" : undefined }} />
                                {t.label} ({t.count})
                            </button>
                        ))}

                        {bartenderTab === "live" && statusFilter && (
                            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px",
                                borderRadius:20, background:STATUS_BG[statusFilter],
                                color:STATUS_COLOR[statusFilter], fontSize:12, fontWeight:600 }}>
                                Showing: {statusFilter}
                                <button onClick={() => setStatusFilter(null)}
                                        style={{ background:"transparent", border:"none", cursor:"pointer",
                                            color:STATUS_COLOR[statusFilter], fontSize:13, padding:0, lineHeight:1 }}>
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        )}

                        <button onClick={() => void fetchOrders()}
                                style={{ marginLeft:"auto", padding:"8px 14px", borderRadius:20,
                                    border:"1px solid #2e2050", background:"transparent",
                                    color:"#7a6a90", cursor:"pointer", fontSize:13,
                                    display:"flex", alignItems:"center", gap:6 }}>
                            <FontAwesomeIcon icon={faRotateRight} /> Refresh
                        </button>
                    </div>

                    {bartenderTab === "history" && (
                        <div style={{ marginBottom:16 }}>
                            <button onClick={() => setShowFilters(!showFilters)}
                                    style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 16px",
                                        borderRadius:12, cursor:"pointer", fontSize:13,
                                        border:`1px solid ${hasDateFilter ? "#c9a84c" : "#2e2050"}`,
                                        background: hasDateFilter ? "#c9a84c18" : "transparent",
                                        color: hasDateFilter ? "#c9a84c" : "#7a6a90",
                                        fontWeight: hasDateFilter ? 600 : 400 }}>
                                <FontAwesomeIcon icon={faFilter} />
                                Filter by date
                                {hasDateFilter && (
                                    <span style={{ background:"#c9a84c", color:"#1a0f2e",
                                        borderRadius:10, padding:"1px 8px", fontSize:11, fontWeight:700 }}>ON</span>
                                )}
                                <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} style={{ fontSize:11 }} />
                            </button>

                            {showFilters && (
                                <div style={{ marginTop:10, background:"#1a1625", border:"1px solid #2e2050",
                                    borderRadius:14, padding:"16px 14px" }}>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                                        {[
                                            { label:"From", value:historyDateFrom, setter:setHistoryDateFrom },
                                            { label:"To",   value:historyDateTo,   setter:setHistoryDateTo },
                                        ].map(f => (
                                            <div key={f.label}>
                                                <div style={{ fontSize:10, color:"#6b6080", letterSpacing:1,
                                                    textTransform:"uppercase", marginBottom:6,
                                                    display:"flex", alignItems:"center", gap:5 }}>
                                                    <FontAwesomeIcon icon={faCalendarDays} /> {f.label}
                                                </div>
                                                <input type="date" value={f.value}
                                                       onChange={e => f.setter(e.target.value)}
                                                       style={{ width:"100%", padding:"10px 12px" }} />
                                            </div>
                                        ))}
                                    </div>
                                    {hasDateFilter && (
                                        <button onClick={() => { setHistoryDateFrom(""); setHistoryDateTo(""); }}
                                                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
                                                    borderRadius:10, border:"1px solid #3a2a5e",
                                                    background:"transparent", color:"#f87171", cursor:"pointer", fontSize:13 }}>
                                            <FontAwesomeIcon icon={faTimesCircle} /> Clear filter
                                        </button>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop:10, position:"relative" }}>
                                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                                    color:"#4a3a60", fontSize:13, pointerEvents:"none" }}>🔍</span>
                                <input type="text" placeholder="Search table, guest, item…"
                                       value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                                       style={{ width:"100%", padding:"11px 12px 11px 34px" }} />
                                {historySearch && (
                                    <button onClick={() => setHistorySearch("")}
                                            style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                                                background:"transparent", border:"none", cursor:"pointer",
                                                color:"#7a6a90", fontSize:14, padding:0, lineHeight:1 }}>✕</button>
                                )}
                            </div>

                            {historyOrders.length > 0 && (
                                <div style={{ marginTop:10, display:"flex", gap:10, flexWrap:"wrap" }}>
                                    <Chip label="Orders" value={historyOrders.length} />
                                    <Chip label="Revenue" value={`GHC ${historyTotal.toFixed(2)}`} gold />
                                </div>
                            )}
                        </div>
                    )}

                    {loadingOrders ? (
                        <div style={{ textAlign:"center", color:"#4a3a60", padding:48 }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize:28, display:"block", margin:"0 auto 12px" }} />
                            Loading orders…
                        </div>
                    ) : displayList.length === 0 ? (
                        <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:16,
                            padding:40, textAlign:"center", color:"#4a3a60" }}>
                            {bartenderTab === "live"
                                ? statusFilter ? `No ${statusFilter.toLowerCase()} orders right now.` : "No active orders. Waiting for customers…"
                                : hasDateFilter ? "No orders match this date range." : "No completed orders yet."}
                        </div>
                    ) : (
                        <div style={{ display:"grid", gap:10 }}>
                            {displayList.map(order => (
                                <div key={order.id} className="ocard" onClick={() => setSelectedOrder(order)}
                                     style={{ background:"#1a1625", border:"1px solid #2e2050",
                                         borderRadius:16, padding:14,
                                         opacity: order.status==="Delivered" ? 0.72 : 1 }}>

                                    <div style={{ display:"flex", justifyContent:"space-between",
                                        alignItems:"flex-start", marginBottom:10, gap:8 }}>
                                        <div style={{ minWidth:0 }}>
                                            <div style={{ fontWeight:700, fontSize:15,
                                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                {order.guest_name}
                                            </div>
                                            <div style={{ color:"#7a6a90", fontSize:12, marginTop:2 }}>
                                                Table <strong style={{ color:"#c9a84c" }}>{order.table_no}</strong>
                                                {" · "}{new Date(order.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                                                {bartenderTab === "history" && (
                                                    <span style={{ color:"#4a3a60" }}>
                                                        {" · "}{new Date(order.created_at).toLocaleDateString([], { day:"numeric", month:"short" })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                                            <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                                                color:STATUS_COLOR[order.status], background:STATUS_BG[order.status] }}>
                                                {order.status}
                                            </span>
                                            <FontAwesomeIcon icon={faChevronRight} style={{ color:"#3a2a5e", fontSize:11 }} />
                                        </div>
                                    </div>

                                    <div style={{ borderTop:"1px solid #2e2050", paddingTop:8, marginBottom:10 }}>
                                        {order.items.slice(0, 2).map((item, i) => (
                                            <div key={i} style={{ display:"flex", justifyContent:"space-between",
                                                fontSize:13, gap:8, marginBottom:3 }}>
                                                <span style={{ color:"#a09abf", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                                    {item.name}{item.variant ? ` · ${item.variant}` : ""} × {item.qty}
                                                </span>
                                                <span style={{ color:"#c9a84c", flexShrink:0 }}>GHC {item.price * item.qty}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div style={{ fontSize:11, color:"#4a3a60", marginTop:2 }}>
                                                +{order.items.length-2} more — tap to view all
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                                        borderTop:"1px solid #2e2050", paddingTop:10, gap:8, flexWrap:"wrap" }}>
                                        <span style={{ fontWeight:700, color:"#c9a84c", fontSize:15 }}>GHC {order.total}</span>
                                        {STATUS_NEXT[order.status] && (
                                            <button onClick={e => { e.stopPropagation(); updateStatus(order.id, STATUS_NEXT[order.status]); }}
                                                    style={{ padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                                                        fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5,
                                                        color:STATUS_COLOR[STATUS_NEXT[order.status]],
                                                        background:STATUS_BG[STATUS_NEXT[order.status]] }}>
                                                <FontAwesomeIcon icon={STATUS_ICON[order.status]} />
                                                {STATUS_LABEL[order.status]}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <footer style={{ textAlign:"center", padding:"20px 16px", borderTop:"1px solid #1e1a35", marginTop:8 }}>
                <p style={{ margin:0, fontSize:11, color:"#3a2a5e", letterSpacing:1 }}>
                    &copy; {new Date().getFullYear()} <span style={{ color:"#5a4a7e", fontWeight:600 }}>FervTech</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

/* ─────────────────────────── SHARED COMPONENTS ─────────────────── */
function NavBtn({ label, active, badge, onClick }) {
    return (
        <button onClick={onClick}
                style={{ padding:"7px 13px", borderRadius:20, border:"1px solid", cursor:"pointer",
                    fontSize:12, position:"relative", flexShrink:0,
                    borderColor: active ? "#c9a84c" : "#2e2050",
                    background:  active ? "#c9a84c18" : "transparent",
                    color:       active ? "#c9a84c" : "#7a6a90" }}>
            {label}
            {badge > 0 && (
                <span style={{ position:"absolute", top:-6, right:-6,
                    background:"#dc2626", color:"#fff", borderRadius:"50%",
                    width:17, height:17, display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:9, fontWeight:700 }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function QtyBtn({ children, onClick, accent, small }) {
    return (
        <button onClick={onClick}
                style={{ width: small ? 26 : 32, height: small ? 26 : 32, borderRadius:8, border:"none",
                    background: accent ? "#7c3aed" : "#2e2050", color:"#fff", cursor:"pointer",
                    fontSize: small ? 10 : 12, display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0 }}>
            {children}
        </button>
    );
}

function Chip({ label, value, gold }) {
    return (
        <div style={{ background:"#1a1625", border:"1px solid #2e2050", borderRadius:10, padding:"8px 14px", fontSize:13 }}>
            <span style={{ color:"#6b6080" }}>{label}: </span>
            <strong style={{ color: gold ? "#c9a84c" : "#f5f0e8" }}>{value}</strong>
        </div>
    );
}