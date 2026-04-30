import { QuizStep } from '@/types';

// Fragrance notes organized by category (6 categories, 56 notes)
export const fragranceNotes = {
    citrusFresh: [
        { id: 'bergamot', label: 'Bergamot', labelAr: 'برغموت', icon: 'bergamot', iconImage: '/icons/scents/bergamot.png' },
        { id: 'citron', label: 'Citron', labelAr: 'سيترون', icon: 'citron' },
        { id: 'grapefruit', label: 'Grapefruit', labelAr: 'جريب فروت', icon: 'grapefruit', iconImage: '/icons/scents/grapefruit.png' },
        { id: 'lemon', label: 'Lemon', labelAr: 'ليمون', icon: 'lemon' },
        { id: 'orange', label: 'Orange', labelAr: 'برتقال', icon: 'blood-orange' },
        { id: 'green-apple', label: 'Green Apple', labelAr: 'تفاح أخضر', icon: 'apple' },
        { id: 'green-notes', label: 'Green Notes', labelAr: 'نوتات خضراء', icon: 'green-notes' },
        { id: 'water-notes', label: 'Water Notes', labelAr: 'نوتات مائية', icon: 'wave' },
        { id: 'marine-notes', label: 'Marine Notes', labelAr: 'نوتات بحرية', icon: 'wave' },
        { id: 'beach', label: 'Beach', labelAr: 'شاطئ', icon: 'wave' },
    ],
    fruits: [
        { id: 'apricot', label: 'Apricot', labelAr: 'مشمش', icon: 'apricot' },
        { id: 'blackcurrant', label: 'Black Currant', labelAr: 'كشمش أسود', icon: 'blackcurrant' },
        { id: 'fig', label: 'Fig', labelAr: 'تين', icon: 'fig' },
        { id: 'lychee', label: 'Litchi', labelAr: 'ليتشي', icon: 'lychee' },
        { id: 'mango', label: 'Mango', labelAr: 'مانجو', icon: 'mango' },
        { id: 'pineapple', label: 'Pineapple', labelAr: 'أناناس', icon: 'pineapple' },
        { id: 'pear', label: 'Pear', labelAr: 'كمثرى', icon: 'pear' },
        { id: 'strawberry', label: 'Strawberries', labelAr: 'فراولة', icon: 'strawberry' },
        { id: 'tropical-fruits', label: 'Tropical Fruits', labelAr: 'فواكه استوائية', icon: 'mango' },
        { id: 'berries', label: 'Berries', labelAr: 'توت', icon: 'raspberry' },
    ],
    sweetGourmand: [
        { id: 'caramel', label: 'Caramel', labelAr: 'كراميل', icon: 'caramel' },
        { id: 'honey', label: 'Honey', labelAr: 'عسل', icon: 'honey' },
        { id: 'marshmallow', label: 'Marshmallow', labelAr: 'مارشميلو', icon: 'marshmallow' },
        { id: 'sugar', label: 'Sugar', labelAr: 'سكر', icon: 'sugar' },
        { id: 'vanilla', label: 'Vanilla', labelAr: 'فانيليا', icon: 'vanilla', iconImage: '/icons/scents/vanilla.png' },
        { id: 'vanilla-caviar', label: 'Vanilla Caviar', labelAr: 'فانيليا كافيار', icon: 'vanilla' },
        { id: 'tonka', label: 'Tonka Beans', labelAr: 'تونكا', icon: 'tonka' },
        { id: 'cacao', label: 'Cacao', labelAr: 'كاكاو', icon: 'chocolate' },
        { id: 'white-rum', label: 'White Rum', labelAr: 'روم أبيض', icon: 'rum' },
        { id: 'brandy', label: 'Brandy', labelAr: 'براندي', icon: 'cognac' },
        { id: 'rum', label: 'Rum', labelAr: 'روم', icon: 'rum' },
    ],
    herbalFloral: [
        { id: 'green-tea', label: 'Chinese Tea', labelAr: 'شاي صيني', icon: 'black-tea' },
        { id: 'geranium', label: 'Geranium', labelAr: 'إبرة الراعي', icon: 'geranium' },
        { id: 'iris', label: 'Iris', labelAr: 'سوسن', icon: 'iris' },
        { id: 'lavender', label: 'Lavender', labelAr: 'لافندر', icon: 'lavender' },
        { id: 'mint', label: 'Mint', labelAr: 'نعناع', icon: 'mint' },
        { id: 'neroli', label: 'Neroli', labelAr: 'نيرولي', icon: 'blossom' },
        { id: 'orange-blossom', label: 'Orange Blossom', labelAr: 'زهر البرتقال', icon: 'blossom' },
        { id: 'turkish-rose', label: 'Turkish Rose', labelAr: 'ورد تركي', icon: 'rose', iconImage: '/icons/scents/turkish-rose.png' },
    ],
    woodyEarthy: [
        { id: 'amber', label: 'Amber', labelAr: 'عنبر', icon: 'amber', iconImage: '/icons/scents/amber.png' },
        { id: 'oakmoss', label: 'Oakmoss', labelAr: 'طحلب البلوط', icon: 'oakmoss' },
        { id: 'woods', label: 'Woods', labelAr: 'أخشاب', icon: 'cedar' },
        { id: 'incense', label: 'Incense', labelAr: 'بخور', icon: 'incense' },
    ],
    baseAccent: [
        { id: 'ambroxan', label: 'Ambroxan', labelAr: 'أمبروكسان', icon: 'ambroxan' },
        { id: 'musk', label: 'Musk', labelAr: 'مسك', icon: 'musk', iconImage: '/icons/scents/musk.png' },
        { id: 'ginger', label: 'Ginger', labelAr: 'زنجبيل', icon: 'ginger' },
        { id: 'pepper', label: 'Pepper', labelAr: 'فلفل', icon: 'black-pepper' },
        { id: 'juniper', label: 'Juniper Berries', labelAr: 'عرعر', icon: 'juniper' },
    ],
};

// Note categories for the quiz UI
/** Lucide PascalCase names (`lucide-react`) for category accordion headers — aligns with `perfume_leaked-main`/ICON_MAPPING.md */
export const noteCategories = [
    { id: 'citrusFresh', label: 'Citrus & Fresh', labelAr: 'حمضيات ومنعش', icon: 'citrus', lucideIcon: 'Citrus', description: '10 notes' },
    { id: 'fruits', label: 'Fruits', labelAr: 'فواكه', icon: 'fruity', lucideIcon: 'Apple', description: '10 notes' },
    { id: 'sweetGourmand', label: 'Sweet & Gourmand', labelAr: 'حلو', icon: 'gourmand', lucideIcon: 'Cookie', description: '11 notes' },
    { id: 'herbalFloral', label: 'Herbal & Floral', labelAr: 'عشبي وزهري', icon: 'floral', lucideIcon: 'Flower2', description: '8 notes' },
    { id: 'woodyEarthy', label: 'Woody & Earthy', labelAr: 'خشبي وترابي', icon: 'woody', lucideIcon: 'Trees', description: '4 notes' },
    { id: 'baseAccent', label: 'Base & Accent Notes', labelAr: 'نوتات أساسية', icon: 'ambery', lucideIcon: 'Gem', description: '5 notes' },
] as const;

// Get all notes as a flat array
export const allNotes = Object.values(fragranceNotes).flat();

export const uniqueAllNotes = Array.from(
    new Map(allNotes.map(note => [note.id, note])).values()
);

/** Shortcut chips on the notes step — IDs must exist in `uniqueAllNotes`. */
export const quickPickNoteIds: readonly string[] = [
    'vanilla',
    'musk',
    'bergamot',
    'grapefruit',
    'turkish-rose',
    'amber',
];

// Notes commonly avoided
export const commonlyAvoidedNotes = [
    { id: 'oud', label: 'Heavy Oud', labelAr: 'عود ثقيل', icon: 'oud' },
    { id: 'rose', label: 'Strong Rose', labelAr: 'ورد قوي', icon: 'rose' },
    { id: 'vanilla', label: 'Heavy Vanilla', labelAr: 'فانيليا ثقيلة', icon: 'vanilla' },
    { id: 'musk', label: 'Strong Musk', labelAr: 'مسك قوي', icon: 'musk' },
    { id: 'tobacco', label: 'Tobacco', labelAr: 'تبغ', icon: 'tobacco' },
    { id: 'patchouli', label: 'Patchouli', labelAr: 'باتشولي', icon: 'patchouli' },
    { id: 'leather', label: 'Leather', labelAr: 'جلد', icon: 'leather' },
    { id: 'smoke', label: 'Smoke', labelAr: 'دخان', icon: 'smoke' },
    { id: 'incense', label: 'Incense', labelAr: 'بخور', icon: 'incense' },
    { id: 'animalic', label: 'Animalic Notes', labelAr: 'روائح حيوانية', icon: 'leather' },
    { id: 'powdery', label: 'Powdery Notes', labelAr: 'روائح بودرية', icon: 'white-musk' },
    { id: 'aquatic', label: 'Aquatic/Marine', labelAr: 'مائي/بحري', icon: 'wave' },
    { id: 'none', label: "I'm open to anything!", labelAr: 'منفتح على كل شيء', icon: 'check' },
];

export const quizSteps: QuizStep[] = [
    {
        id: 1,
        name: 'gender',
        question: "Who is this fragrance for?",
        questionAr: "لمن هذا العطر؟",
        type: 'single',
        required: true,
        skippable: false,
        options: [
            { id: 'female', label: 'For Her', labelAr: 'للنساء', icon: 'female' },
            { id: 'male', label: 'For Him', labelAr: 'للرجال', icon: 'girl' },
            { id: 'unisex', label: 'Unisex', labelAr: 'للجنسين', icon: 'unisex' }
        ]
    },
    {
        id: 2,
        name: 'favoriteNotes',
        question: "Which notes do you love?",
        questionAr: "ما النوتات التي تحبها؟",
        type: 'multiple',
        required: false,
        skippable: true,
        options: [
            { id: 'none', label: "No specific notes", labelAr: 'لا يوجد', icon: 'check' },
            ...uniqueAllNotes
        ]
    },
    {
        id: 3,
        name: 'avoidedNotes',
        question: "Any notes you avoid?",
        questionAr: "هل هناك نوتات تريد تجنبها؟",
        type: 'multiple',
        required: false,
        skippable: true,
        options: [
            { id: 'none', label: "I'm open to anything!", labelAr: 'منفتح على كل شيء', icon: 'check' },
            ...uniqueAllNotes
        ]
    },
    {
        id: 4,
        name: 'season',
        question: "When will you mostly wear this?",
        questionAr: "متى سترتدي هذا العطر؟",
        type: 'single',
        required: true,
        skippable: false,
        options: [
            { id: 'spring', label: 'Spring', labelAr: 'الربيع', icon: 'spring', iconImage: '/icons/scents/step4-5/spring.png', description: 'Light & fresh' },
            { id: 'summer', label: 'Summer', labelAr: 'الصيف', icon: 'summer', iconImage: '/icons/scents/step4-5/summer.png', description: 'Citrus & aquatic' },
            { id: 'fall', label: 'Fall', labelAr: 'الخريف', icon: 'fall', iconImage: '/icons/scents/step4-5/fall.png', description: 'Warm & spicy' },
            { id: 'winter', label: 'Winter', labelAr: 'الشتاء', icon: 'winter', iconImage: '/icons/scents/step4-5/winter.png', description: 'Rich & cozy' },
            { id: 'all', label: 'All Year', labelAr: 'طوال السنة', icon: 'calendar', iconImage: '/icons/scents/step4-5/allyear.png', description: 'Versatile' },
        ]
    },
    {
        id: 5,
        name: 'intensity',
        question: "How strong do you like your fragrance?",
        questionAr: "ما مدى قوة العطر؟",
        type: 'single',
        required: true,
        skippable: false,
        options: [
            {
                id: 'light',
                label: 'Moderate',
                labelAr: 'معتدل',
                icon: 'light',
                iconImage: '/icons/scents/step4-5/moderate.png',
                description: 'Soft landing'
            },
            {
                id: 'moderate',
                label: 'Strong',
                labelAr: 'قوي',
                icon: 'moderate',
                iconImage: '/icons/scents/step4-5/strong.png',
                description: 'Noticeable'
            },
            {
                id: 'strong',
                label: 'Enormous',
                labelAr: 'هائل',
                icon: 'strong',
                iconImage: '/icons/scents/step4-5/enormous.png',
                description: 'Fills the room'
            }
        ]
    }
];
