export type Lang = "ar" | "en"

export const translations = {
  ar: {
    // General
    appName: "منصة المهارات",
    subtitle: "منصة لبيع وشراء الدورات التعليمية باستخدام Pi",
    description:
      "منصة المهارات تتيح للمستخدمين استكشاف وشراء الدورات التعليمية الرقمية باستخدام Pi داخل Pi Browser، مع دعم المحتوى المجاني والمدفوع ورفع الملفات التعليمية بشكل آمن.",
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    back: "← العودة",
    search: "بحث",
    new: "جديد",
    free: "مجاني",
    unknown: "غير معروف",
    notSpecified: "غير محددة",

    // Navigation
    home: "الرئيسية",
    profile: "الملف الشخصي",
    createCourse: "أنشئ دورة",
    myCourses: "دوراتي",
    exploreCourses: "استكشاف الدورات",

    // Home page
    homeTitle: "دورات تدريبية 🎓",
    homeSubtitle: "استكشف الدورات المنشورة في المنصة",
    searchCourses: "ابحث عن الدورات...",
    courses: "الدورات",
    noCourses: "لا توجد دورات مطابقة",
    loadingCourses: "جاري تحميل الدورات...",
    failedToLoadCourses: "تعذر تحميل الدورات",
    startNow: "ابدأ الآن",

    // Course details
    instructorBy: "بواسطة",
    rating: "التقييم",
    students: "الطلاب",
    duration: "المدة",
    price: "السعر",
    noDescription: "لا يوجد وصف",
    courseNotFound: "لم يتم العثور على الدورة",
    loadingCourse: "جاري تحميل الدورة...",
    courseContentAccess: "لديك صلاحية الوصول إلى محتوى الدورة",
    noUploadedContent: "لا يوجد محتوى مرفوع بعد لهذه الدورة.",
    courseVideo: "فيديو الدورة",
    courseFile: "ملف الدورة",
    openOrDownloadFile: "فتح / تحميل الملف",
    checkingAccess: "جاري التحقق من صلاحية الوصول...",
    invalidPrice: "سعر الدورة غير صالح",

    // Payments
    buyNow: "اشترِ الآن",
    buyingNow: "جاري الدفع...",
    paymentStarted: "جاري بدء الدفع...",
    paymentApproving: "جاري اعتماد الدفع...",
    paymentCompleting: "جاري إكمال الدفع...",
    paymentCancelled: "تم إلغاء الدفع",
    paymentSuccess: "تم شراء الدورة بنجاح",
    paymentFailed: "حدث خطأ أثناء الدفع",
    paymentUnavailable: "الدفع غير متاح. افتح التطبيق من داخل Pi Browser",
    securePayment: "دفع آمن داخل تطبيق Pi",
    payWithPi: "شراء الدورات باستخدام Pi",

    // Profile / Pi auth
    profileTitle: "الملف الشخصي",
    profileSubtitle: "يمكنك ربط حساب Pi من هنا ثم إدارة دوراتك.",
    connectPiSection: "ربط حساب Pi",
    connectPi: "ربط حساب Pi",
    piReady: "Pi SDK جاهز",
    piChecking: "جاري التحقق من Pi SDK...",
    piMissing: "Pi SDK غير موجود. افتح التطبيق من داخل Pi Browser",
    piInitFailed: "تعذر تهيئة Pi SDK",
    piNotReady: "Pi SDK غير جاهز",
    piLinking: "جاري ربط حساب Pi...",
    piVerifyFailed: "فشل التحقق من مستخدم Pi",
    piAuthNoToken: "لم يصل accessToken من Pi",
    piUserDataMissing: "لم تصل بيانات المستخدم الموثقة",
    piLinkedSuccess: "تم الربط بنجاح",
    piLinkFailed: "فشل الربط",
    restoredSavedAccount: "تم استرجاع الحساب المحفوظ",
    loggedOut: "تم تسجيل الخروج",
    logout: "تسجيل الخروج",
    username: "اسم مستخدم Pi",
    uid: "UID",
    mustConnectPiFirst: "يجب ربط حساب Pi أولًا من صفحة الملف الشخصي قبل شراء الدورة.",

    // My courses
    myCoursesTitle: "دوراتي",
    myCoursesSubtitle: "الدورات التي أنشأتها أو اشتريتها",
    noOwnedCourses: "لا توجد لديك دورات بعد",

    // Create course
    createCourseTitle: "إنشاء دورة جديدة",
    createCourseSubtitle: "أضف دورة جديدة وابدأ في بيع المحتوى التعليمي",
    courseTitle: "عنوان الدورة",
    courseDescription: "وصف الدورة",
    instructorName: "اسم المدرب",
    coursePrice: "سعر الدورة",
    currency: "العملة",
    isFreeCourse: "دورة مجانية",
    imageUrl: "صورة الدورة",
    videoUrl: "فيديو الدورة",
    fileUrl: "ملف الدورة",
    uploadEducationalContent: "ارفع الملفات التعليمية وحدد السعر وشارك معرفتك مع الجميع",
    publishCourse: "نشر الدورة",
    publishingCourse: "جاري نشر الدورة...",
    courseCreatedSuccess: "تم إنشاء الدورة بنجاح",
    courseCreatedFailed: "فشل إنشاء الدورة",
    fillRequiredFields: "يرجى ملء الحقول المطلوبة",

    // Legal
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "الشروط والأحكام",

    // Ecosystem / marketing
    ecosystemHeadline: "منصة المهارات",
    ecosystemSubheadline: "استكشف واشترِ الدورات التعليمية باستخدام Pi",
    ecosystemCreateSell: "أنشئ دورتك وابدأ البيع",
  },

  en: {
    // General
    appName: "Maharat Platform",
    subtitle: "A platform for buying and selling educational courses using Pi",
    description:
      "Maharat Platform allows users to explore and purchase digital educational courses using Pi inside Pi Browser, with support for free and paid content and secure educational file uploads.",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "← Back",
    search: "Search",
    new: "New",
    free: "Free",
    unknown: "Unknown",
    notSpecified: "Not specified",

    // Navigation
    home: "Home",
    profile: "Profile",
    createCourse: "Create Course",
    myCourses: "My Courses",
    exploreCourses: "Explore Courses",

    // Home page
    homeTitle: "Training Courses 🎓",
    homeSubtitle: "Explore published courses on the platform",
    searchCourses: "Search courses...",
    courses: "Courses",
    noCourses: "No matching courses found",
    loadingCourses: "Loading courses...",
    failedToLoadCourses: "Failed to load courses",
    startNow: "Start Now",

    // Course details
    instructorBy: "By",
    rating: "Rating",
    students: "Students",
    duration: "Duration",
    price: "Price",
    noDescription: "No description available",
    courseNotFound: "Course not found",
    loadingCourse: "Loading course...",
    courseContentAccess: "You have access to this course content",
    noUploadedContent: "No content has been uploaded for this course yet.",
    courseVideo: "Course Video",
    courseFile: "Course File",
    openOrDownloadFile: "Open / Download File",
    checkingAccess: "Checking access permissions...",
    invalidPrice: "Invalid course price",

    // Payments
    buyNow: "Buy Now",
    buyingNow: "Processing payment...",
    paymentStarted: "Starting payment...",
    paymentApproving: "Approving payment...",
    paymentCompleting: "Completing payment...",
    paymentCancelled: "Payment cancelled",
    paymentSuccess: "Course purchased successfully",
    paymentFailed: "An error occurred during payment",
    paymentUnavailable: "Payment is unavailable. Open the app inside Pi Browser",
    securePayment: "Secure payment inside Pi app",
    payWithPi: "Buy courses with Pi",

    // Profile / Pi auth
    profileTitle: "Profile",
    profileSubtitle: "Connect your Pi account here and manage your courses.",
    connectPiSection: "Connect Pi Account",
    connectPi: "Connect Pi Account",
    piReady: "Pi SDK is ready",
    piChecking: "Checking Pi SDK...",
    piMissing: "Pi SDK is not available. Open the app inside Pi Browser",
    piInitFailed: "Failed to initialize Pi SDK",
    piNotReady: "Pi SDK is not ready",
    piLinking: "Connecting Pi account...",
    piVerifyFailed: "Failed to verify Pi user",
    piAuthNoToken: "No accessToken was returned from Pi",
    piUserDataMissing: "Verified user data was not returned",
    piLinkedSuccess: "Account connected successfully",
    piLinkFailed: "Failed to connect account",
    restoredSavedAccount: "Saved account restored",
    loggedOut: "Logged out successfully",
    logout: "Log Out",
    username: "Pi Username",
    uid: "UID",
    mustConnectPiFirst: "You must connect your Pi account first from the profile page before purchasing the course.",

    // My courses
    myCoursesTitle: "My Courses",
    myCoursesSubtitle: "Courses you created or purchased",
    noOwnedCourses: "You do not have any courses yet",

    // Create course
    createCourseTitle: "Create New Course",
    createCourseSubtitle: "Add a new course and start selling educational content",
    courseTitle: "Course Title",
    courseDescription: "Course Description",
    instructorName: "Instructor Name",
    coursePrice: "Course Price",
    currency: "Currency",
    isFreeCourse: "Free Course",
    imageUrl: "Course Image",
    videoUrl: "Course Video",
    fileUrl: "Course File",
    uploadEducationalContent: "Upload educational files, set the price, and share your knowledge with everyone",
    publishCourse: "Publish Course",
    publishingCourse: "Publishing course...",
    courseCreatedSuccess: "Course created successfully",
    courseCreatedFailed: "Failed to create course",
    fillRequiredFields: "Please fill in the required fields",

    // Legal
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",

    // Ecosystem / marketing
    ecosystemHeadline: "Maharat Platform",
    ecosystemSubheadline: "Explore and buy educational courses using Pi",
    ecosystemCreateSell: "Create your course and start selling",
  },
} as const

export function getDirection(lang: Lang) {
  return lang === "ar" ? "rtl" : "ltr"
}

export function getLanguageName(lang: Lang) {
  return lang === "ar" ? "العربية" : "English"
}

export function detectBrowserLanguage(): Lang {
  if (typeof window === "undefined") return "ar"

  const saved = window.localStorage.getItem("app_lang") as Lang | null
  if (saved === "ar" || saved === "en") return saved

  const browserLang = navigator.language || "ar"
  return browserLang.toLowerCase().startsWith("ar") ? "ar" : "en"
}

export function applyLanguage(lang: Lang) {
  if (typeof document === "undefined") return
  document.documentElement.lang = lang
  document.documentElement.dir = getDirection(lang)
}
