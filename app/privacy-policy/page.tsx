import type { CSSProperties } from "react"

export const metadata = {
  title: "سياسة الخصوصية | منصة المهارات",
}

export default function PrivacyPolicyPage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>سياسة الخصوصية</h1>
        <p style={mutedStyle}>آخر تحديث: 2026-04-19</p>

        <section style={sectionStyle}>
          <p style={textStyle}>
            توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات عند استخدام تطبيق
            <strong> منصة المهارات </strong>
            داخل Pi Browser.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. المعلومات التي نجمعها</h2>
          <p style={textStyle}>قد نجمع الأنواع التالية من البيانات:</p>
          <ul style={listStyle}>
            <li>اسم المستخدم الخاص بك في Pi.</li>
            <li>المعرف الفريد لحساب Pi الخاص بك (UID).</li>
            <li>بيانات الدورات التي تنشئها أو تشتريها داخل التطبيق.</li>
            <li>بيانات المدفوعات المرتبطة بعمليات الشراء داخل التطبيق، مثل معرف الدفع وحالة العملية.</li>
            <li>روابط الملفات أو الوسائط التي ترفعها لغرض إنشاء أو عرض الدورات.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. كيف نستخدم المعلومات</h2>
          <ul style={listStyle}>
            <li>تمكين تسجيل الدخول وربط حساب Pi بالتطبيق.</li>
            <li>عرض الدورات وإدارة المحتوى التعليمي.</li>
            <li>معالجة عمليات شراء الدورات داخل التطبيق باستخدام Pi.</li>
            <li>التحقق من وصول المستخدم إلى المحتوى المدفوع.</li>
            <li>تحسين أداء التطبيق وتجربة الاستخدام.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. المدفوعات</h2>
          <p style={textStyle}>
            تتم معالجة المدفوعات باستخدام أدوات Pi Network. نحن لا نحتفظ بالمفاتيح
            الخاصة بمحفظتك ولا نطلب عبارة الاسترداد أو كلمات المرور الخاصة بك.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. التخزين والاستضافة</h2>
          <p style={textStyle}>
            قد يتم تخزين بيانات التطبيق والمحتوى والملفات باستخدام خدمات خارجية
            مثل Supabase وVercel لتشغيل التطبيق بشكل آمن وفعال.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. مشاركة البيانات</h2>
          <p style={textStyle}>
            نحن لا نبيع بياناتك الشخصية لأي طرف ثالث. قد تتم مشاركة بعض البيانات
            فقط عند الحاجة التقنية لتشغيل التطبيق، مثل خدمات الاستضافة وقواعد
            البيانات والتخزين السحابي.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. حماية البيانات</h2>
          <p style={textStyle}>
            نتخذ إجراءات معقولة لحماية بيانات المستخدم من الوصول غير المصرح به أو
            التعديل أو الفقدان أو سوء الاستخدام.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. الاحتفاظ بالبيانات</h2>
          <p style={textStyle}>
            نحتفظ بالبيانات طالما كان ذلك ضروريًا لتقديم خدمات التطبيق أو للامتثال
            للمتطلبات التقنية أو القانونية.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>8. حقوق المستخدم</h2>
          <p style={textStyle}>
            يمكنك طلب تحديث أو حذف بعض بياناتك المرتبطة بالتطبيق، ما لم تكن هناك
            حاجة تقنية أو قانونية للاحتفاظ بها.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>9. روابط وخدمات خارجية</h2>
          <p style={textStyle}>
            قد يحتوي التطبيق على روابط أو ملفات أو وسائط مستضافة عبر خدمات خارجية.
            لسنا مسؤولين عن سياسات الخصوصية الخاصة بتلك الخدمات خارج نطاق تطبيقنا.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>10. تحديثات السياسة</h2>
          <p style={textStyle}>
            قد نقوم بتحديث هذه السياسة من وقت لآخر. استمرارك في استخدام التطبيق
            بعد نشر أي تحديث يعني موافقتك على النسخة الجديدة.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>11. التواصل</h2>
          <p style={textStyle}>
            للاستفسارات المتعلقة بالخصوصية، يمكنك التواصل عبر البريد الإلكتروني:
            <br />
            <strong>idsaidkarim@gmail.com</strong>
          </p>
        </section>
      </div>
    </main>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "24px 12px 48px",
}

const containerStyle: CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 24,
  padding: 24,
}

const titleStyle: CSSProperties = {
  fontSize: 32,
  fontWeight: 900,
  margin: "0 0 8px",
  color: "#0f172a",
}

const mutedStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 24,
}

const sectionStyle: CSSProperties = {
  marginBottom: 24,
}

const headingStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  marginBottom: 10,
  color: "#0f172a",
}

const textStyle: CSSProperties = {
  color: "#334155",
  lineHeight: 1.9,
  margin: 0,
}

const listStyle: CSSProperties = {
  color: "#334155",
  lineHeight: 1.9,
  paddingRight: 20,
  margin: 0,
}
