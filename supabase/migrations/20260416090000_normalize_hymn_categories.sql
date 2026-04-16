-- Migration: Normalize hymn categories to canonical set
-- Canonical categories: Traditional, Birth, Resurrection, Worship, Praise,
--                       Assurance, Faith, Hope, Salvation
--
-- Run after 20260415172300_add_hymns.sql

-- 1. Rename Christmas → Birth
UPDATE public.hymns SET category = 'Birth'        WHERE category = 'Christmas';

-- 2. Rename Easter → Resurrection
UPDATE public.hymns SET category = 'Resurrection' WHERE category = 'Easter';

-- 3. Fix typo "Warship" → Worship
UPDATE public.hymns SET category = 'Worship'      WHERE category = 'Warship';

-- 4. Normalize lowercase worship → Worship
UPDATE public.hymns SET category = 'Worship'      WHERE category = 'worship';

-- 5. Harvest → Traditional  (Bringing In The Sheaves)
UPDATE public.hymns SET category = 'Traditional'  WHERE category = 'Harvest';

-- 6. Children → Traditional  (Jesus Loves Me)
UPDATE public.hymns SET category = 'Traditional'  WHERE category = 'Children';

-- 7. Heaven → Hope  (When We All Get To Heaven)
UPDATE public.hymns SET category = 'Hope'         WHERE category = 'Heaven';

-- 8. Invitation → Salvation  (Kneel At The Cross)
UPDATE public.hymns SET category = 'Salvation'    WHERE category = 'Invitation';

-- 9. Victory → Salvation  (You Overcame, Victory in Jesus)
UPDATE public.hymns SET category = 'Salvation'    WHERE category = 'Victory';

-- 10. Dependence → Faith  (I Need Thee Every Hour)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Dependence';

-- 11. Devotion → Faith  (Be Thou My Vision)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Devotion';

-- 12. Grace → Faith  (Come Thou Fount)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Grace';

-- 13. Gratitude → Praise  (Count Your Blessings)
UPDATE public.hymns SET category = 'Praise'       WHERE category = 'Gratitude';

-- 14. Friendship → Faith  (What A Friend We Have In Jesus)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Friendship';

-- 15. Peace → Assurance  (It Is Well With My Soul)
UPDATE public.hymns SET category = 'Assurance'    WHERE category = 'Peace';

-- 16. Faithfulness → Faith  (Great Is Thy Faithfulness)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Faithfulness';

-- 17. Joy → Praise  (He Gave Me A Song)
UPDATE public.hymns SET category = 'Praise'       WHERE category = 'Joy';

-- 18. Guidance → Faith  (Be With Me Lord)
UPDATE public.hymns SET category = 'Faith'        WHERE category = 'Guidance';

-- Catch-all: any remaining non-canonical category falls back to Traditional
UPDATE public.hymns
SET    category = 'Traditional'
WHERE  category IS NOT NULL
  AND  category NOT IN (
         'Traditional', 'Birth', 'Resurrection',
         'Worship', 'Praise', 'Assurance',
         'Faith', 'Hope', 'Salvation'
       );
