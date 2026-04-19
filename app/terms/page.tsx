import type { CSSProperties } from "react"

export const metadata = {
  title: "الشروط والأحكام | منصة المهارات",
}

export default function TermsPage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>الشروط والأحكام</h1>
        <p style={mutedStyle}>آخر تحديث: 2026-04-19</p>

        <section style={sectionStyle}>
          <p style={textStyle}>
            باستخدامك لتطبيق <strong>منصة المهارات</strong>، فإنك توافق على هذه
            الشروط والأحكام. إذا لم توافق عليها، يرجى عدم استخدام التطبيق.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>1. وصف الخدمة</h2>
          <p style={textStyle}>
            منصة المهارات هي تطبيق يتيح للمستخدمين إنشاء وعرض وشراء الدورات
            التعليمية الرقمية، بما في ذلك المحتوى المجاني والمدفوع، باستخدام Pi
            داخل التطبيق.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>2. حساب المستخدم</h2>
          <p style={textStyle}>
            قد يتطلب استخدام بعض مزايا التطبيق ربط حساب Pi الخاص بك. أنت مسؤول عن
            صحة المعلومات التي تقدمها وعن استخدام حسابك داخل التطبيق.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>3. المحتوى والدورات</h2>
          <ul style={listStyle}>
            <li>يمكن للمستخدمين نشر محتوى تعليمي وفقًا لاستخدام مشروع ومسموح.</li>
            <li>يتحمل ناشر الدورة مسؤولية المحتوى الذي يرفعه أو يبيعه.</li>
            <li>يُمنع نشر محتوى مخالف للقانون أو ينتهك حقوق الآخرين.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>4. المدفوعات والمشتريات</h2>
          <ul style={listStyle}>
            <li>قد تتطلب بعض الدورات دفع قيمة محددة بعملة Pi.</li>
            <li>يتم تنفيذ المدفوعات عبر آليات Pi Network داخل التطبيق.</li>
            <li>لا يتم منح الوصول إلى المحتوى المدفوع إلا بعد تأكيد نجاح العملية.</li>
            <li>جميع الأسعار المعروضة داخل التطبيق يحددها ناشر الدورة.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>5. الاسترداد والنزاعات</h2>
          <p style={textStyle}>
            نظرًا لطبيعة المحتوى الرقمي، قد لا تكون المشتريات قابلة للاسترداد بعد
            منح الوصول إلى الدورة، إلا إذا قرر التطبيق أو ناشر المحتوى خلاف ذلك أو
            إذا كان هناك خطأ تقني واضح.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>6. الاستخدام المسموح</h2>
          <ul style={listStyle}>
            <li>يجب استخدام التطبيق بطريقة قانونية ومسؤولة.</li>
            <li>يُمنع إساءة استخدام التطبيق أو محاولة تعطيله أو التحايل على أنظمته.</li>
            <li>يُمنع إعادة بيع أو نسخ المحتوى المدفوع دون إذن.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>7. الملكية الفكرية</h2>
          <p style={textStyle}>
            تعود حقوق ملكية التطبيق وتصميمه واسمه ومكوناته إلى مالكه أو مطوريه،
            بينما تبقى حقوق المحتوى المرفوع لأصحابه الأصليين ما لم يُذكر خلاف ذلك.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>8. إيقاف الخدمة أو الحساب</h2>
          <p style={textStyle}>
            نحتفظ بالحق في تعليق أو تقييد الوصول إلى التطبيق أو حذف أي محتوى أو
            حساب يخالف هذه الشروط أو يسبب ضررًا للتطبيق أو المستخدمين الآخرين.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>9. حدود المسؤولية</h2>
          <p style={textStyle}>
            يُقدَّم التطبيق كما هو، ونبذل جهدًا معقولًا لتشغيله بشكل صحيح، لكننا لا
            نضمن خلوه من الانقطاعات أو الأخطاء التقنية في جميع الأوقات.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>10. التعديلات</h2>
          <p style={textStyle}>
            يجوز لنا تعديل هذه الشروط في أي وقت. استمرارك في استخدام التطبيق بعد
            التحديث يعني موافقتك على النسخة المعدلة.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>11. التواصل</h2>
          <p style={textStyle}>
            للاستفسارات أو الشكاوى المتعلقة بالشروط، يمكنك التواصل عبر:
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
