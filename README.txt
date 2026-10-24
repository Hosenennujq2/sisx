نسخة GitHub Pages (ثابتة) + قاعدة بيانات Supabase المجانية
1) supabase.com > New project
2) SQL Editor > الصق محتوى supabase.sql > Run
3) Authentication > Providers > Email > عطّل "Confirm email"
4) Project Settings > API: انسخ Project URL و anon public key وضعهم في config.js
5) ارفع الملفات لـ repo على GitHub > Settings > Pages > Deploy from branch (main / root)
6) افتح موقعك، أنشئ حسابك (اسم إنجليزي)، ثم من Supabase SQL Editor شغّل:
   update profiles set role='admin' where username='اسمك';
   سوّيها فوراً قبل ما أحد غيرك يسجّل. (لا يوجد حساب admin جاهز؛ كلمة السر من اختيارك)
تسجيلات الدخول محفوظة في جدول login_logs وتظهر في لوحة الأدمن (وزر تحميل).
