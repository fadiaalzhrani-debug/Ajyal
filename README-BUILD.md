# تطبيق حي أجيال — دليل البناء والنشر على App Store (iOS)

هذا المشروع يغلّف موقع «حي أجيال» داخل تطبيق iOS حقيقي باستخدام **Capacitor**.
كل ملفات الموقع موجودة في مجلد `www/`.

> ⚠️ **يتطلّب جهاز Mac + Xcode** — لا يمكن بناء تطبيقات آبل على ويندوز.
> ونحتاج **حساب Apple Developer** (99$ سنويًا) للنشر على المتجر.

---

## المتطلبات (على جهاز Mac)
- **macOS** حديث + **Xcode** (من App Store).
- **Node.js 18+** و **npm**.
- **CocoaPods**: `sudo gem install cocoapods`
- **حساب Apple Developer** مفعّل: https://developer.apple.com

---

## خطوات البناء (أوامر في Terminal داخل مجلد المشروع)

```bash
# 1) تثبيت الحزم
npm install

# 2) إضافة منصة iOS
npx cap add ios

# 3) توليد كل مقاسات الأيقونة وشاشة البداية من مجلد resources/
npx capacitor-assets generate --ios

# 4) مزامنة ملفات الموقع مع مشروع iOS
npx cap sync ios

# 5) فتح المشروع في Xcode
npx cap open ios
```

## داخل Xcode
1. اختر الهدف **App** ← تبويب **Signing & Capabilities**:
   - فعّل **Automatically manage signing**.
   - اختر **Team** (حساب Apple Developer).
   - **Bundle Identifier**: `com.ajyal.app` (أو غيّره لمعرّف خاص بك).
2. تبويب **General**:
   - **Display Name**: اكتب `حي أجيال` (هذا الاسم اللي يظهر تحت الأيقونة).
   - **Version**: `1.0`  ، **Build**: `1`.
3. جرّب على **محاكي iPhone** أو جهاز حقيقي (زر ▶️).
4. للنشر: **Product ▸ Archive** ← **Distribute App** ← **App Store Connect** ← **Upload**.

## في App Store Connect (appstoreconnect.apple.com)
- أنشئ تطبيقًا جديدًا (App) بنفس الـ Bundle ID.
- عبّئ: الاسم، الوصف، الفئة، **لقطات شاشة** (Screenshots)، **سياسة الخصوصية** (رابط إلزامي).
- اربط الـ Build المرفوع ← **Submit for Review**.

---

## ✅ ميزة أصلية مدمجة (تقلّل رفض آبل — بند 4.2)
التطبيق **يحتوي أصلًا** على ميزة **تنبيهات محلية (Local Notifications)**: زر «🔔 ذكّرني» على بطاقات الفعاليات يجدول تذكيرًا حقيقيًا للمستخدم قبل الفعالية. هذي قيمة أصلية تتجاوز مجرد الموقع.

- الإضافة موجودة في `package.json` (`@capacitor/local-notifications`)، والكود في `www/app.js`.
- تفعّل تلقائيًا عند: `npm install` ثم `npx cap sync ios` (خطوات البناء أعلاه) — التطبيق يطلب إذن الإشعارات عند أول تشغيل.
- **صفحة الخصوصية** مدمجة (`www/privacy.html`) — استخدمي رابطها في App Store Connect.

للتقوية أكثر لاحقًا: يمكن إضافة **Push Notifications** (تحتاج خادم APNs) لإرسال أخبار الحي.

---

## تحديث محتوى التطبيق لاحقًا
عند تعديل الموقع: انسخ الملفات الجديدة داخل `www/` ثم:
```bash
npx cap sync ios
```
وأعد الرفع من Xcode ببناء (Build) جديد.

---

## ملخّص الحالة
- ✅ ملفات الموقع جاهزة في `www/`.
- ✅ إعدادات Capacitor جاهزة (`capacitor.config.json`).
- ✅ أيقونة المتجر `resources/icon.png` (1024×1024) وشاشة البداية `resources/splash.png` (2732×2732).
- ⏳ يتبقّى: البناء على Mac + حساب آبل + المراجعة (خطوات المطوّر أعلاه).
