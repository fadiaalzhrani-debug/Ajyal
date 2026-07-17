# بناء تطبيق حي أجيال على Codemagic (بدون جهاز Mac) 🚀

Codemagic يبني التطبيق في السحابة على جهاز Mac افتراضي، ويقدر يوقّعه ويرفعه لـ App Store تلقائيًا.
ملف الإعداد `codemagic.yaml` جاهز في المشروع.

---

## المتطلبات
- ✅ حساب **Codemagic** (عندكم).
- 🍎 حساب **Apple Developer** مفعّل (99$/سنة).
- 📁 وضع مجلد `ajyal-app` في **مستودع Git** (GitHub / GitLab / Bitbucket).

---

## الخطوة ١: ارفعي المشروع لمستودع Git
أسهل طريقة (بدون أوامر):
1. حمّلي **GitHub Desktop** وسجّلي دخول GitHub.
2. **File → Add local repository** → اختاري مجلد `ajyal-app`.
3. يقول «ليس مستودعًا» → **Create a repository** → **Publish repository** (خليه Private).

## الخطوة ٢: أنشئي مفتاح App Store Connect API (للتوقيع والرفع)
1. في **App Store Connect → Users and Access → Integrations (Keys)**.
2. **Generate API Key** → صلاحية **App Manager** → نزّلي ملف **.p8** واحفظي **Issuer ID** و **Key ID**.
3. في **Codemagic → Teams → (فريقك) → Integrations → App Store Connect → Connect**:
   - ارفعي ملف .p8 + Issuer ID + Key ID.
   - **سمّي المفتاح: `CodemagicASC`** (نفس الاسم الموجود في `codemagic.yaml`).

## الخطوة ٣: سجّلي معرّف التطبيق + أنشئيه
1. في **Apple Developer → Certificates, Identifiers & Profiles → Identifiers** → أنشئي App ID بالمعرّف **`com.ajyal.app`**.
2. في **App Store Connect → Apps → +** → أنشئي التطبيق بنفس الـ Bundle ID، الاسم «حي أجيال».

## الخطوة ٤: اربطي المشروع وابني
1. في Codemagic: **Add application** → اختاري مزوّد Git → اختاري مستودع `ajyal-app`.
2. Codemagic يكتشف `codemagic.yaml` تلقائيًا.
3. اضغطي **Start new build** → يختار Workflow «Ajyal iOS».
4. ينتظر ~١٠–٢٠ دقيقة، ثم:
   - ينتج ملف **IPA**.
   - يرفعه تلقائيًا لـ **TestFlight**.

## الخطوة ٥: النشر النهائي
1. جرّبي التطبيق من **TestFlight** على جوالك.
2. في App Store Connect: عبّي **الوصف، الفئة، لقطات الشاشة**، و**رابط سياسة الخصوصية** (استخدمي `privacy.html` بعد رفع الموقع).
3. **Submit for Review** → مراجعة آبل ~١–٣ أيام.

---

## ملاحظات
- 🔔 **ميزة أصلية مدمجة**: زر «ذكّرني» يجدول إشعارات محلية للفعاليات — تقلّل خطر رفض آبل (بند 4.2).
- 🔁 **تحديث لاحقًا**: عدّلي الموقع، انسخي ملفات الموقع الجديدة داخل `www/`، اعملي Commit + Push → Codemagic يبني نسخة جديدة.
- لو ظهر خطأ توقيع: تأكدي إن اسم المفتاح في Codemagic هو **`CodemagicASC`** بالضبط، وإن الـ Bundle ID متطابق.
