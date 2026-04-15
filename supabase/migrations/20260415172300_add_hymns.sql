-- Hymns table migration
CREATE TABLE IF NOT EXISTS public.hymns (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  verses TEXT[] NOT NULL DEFAULT '{}',
  youtube_id TEXT,
  first_line TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hymns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hymns' AND policyname = 'Anyone can view hymns'
  ) THEN
    CREATE POLICY "Anyone can view hymns" ON public.hymns FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hymns' AND policyname = 'Admins can manage hymns'
  ) THEN
    CREATE POLICY "Admins can manage hymns" ON public.hymns FOR ALL TO authenticated
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END
$$;

INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (1, 'In Christ Alone', 'Keith Getty & Stuart Townend', 'Easter', ARRAY['In Christ alone my hope is found
He is my Light, my Strength, my Song
This Cornerstone, this Solid ground
Firm through the fiercest drought and storm 
 
 What heights of love, what depths of peace?
When fears are stilled, when strivings cease
My Comforter, my All in All
Here in the love of Christ I stand','In Christ alone, who took on flesh
Fullness of God in helpless Babe
This Gift of love and righteousness
Scorned by the ones He came to save
 
''Til on that cross as Jesus died
The wrath of God was satisfied
For every sin on Him was laid
Here in the death of Christ I live','There in the ground His body lay
Light of the world by darkness slain
Then bursting forth in glorious day
Up from the grave He rose again 
 
And as He stands in victory
Sin''s curse has lost its grip on me
For I am His and He is mine
Bought with the precious blood of Christ','No guilt in life, no fear in death
This is the power of Christ in me
From life''s first cry to final breath
Jesus commands my destiny
 
No power of hell, no scheme of man
Can ever pluck me from His hand
''Til He returns or calls me home
Here in the power of Christ I''ll stand'], 'YRPh9fymWu8', 'In Christ alone my hope is found', 'Keith Getty and Stuart Townend are modern hymn writers from the UK known for revitalizing congregational worship. ''In Christ Alone'' is one of the most beloved contemporary hymns, first released in 2001.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (2, 'All to Jesus I Surrender', 'Judson W. Van DeVenter', 'Worship', ARRAY['All to Jesus I surrender,
All to Him I freely give;
I will ever love and trust Him,
In His presence daily live.
 
I surrender all, I surrender all;
All to Thee, my blessed Saviour,
I surrender all.','All to Jesus I surrender,
Humbly at His feet I bow;
Worldly pleasures all forsaken
Take me, Jesus, take me now.','All to Jesus I surrender,
Make me Saviour, wholly Thine;
Let me feel the Holy Spirit,
Truly know Thou art mine.','All to Jesus I surrender,
Lord, I give myself to Thee
Fill me with Thy love and power
Let Thy blessings fall on me','All to Jesus I surrender:
Now I feel he sacred flame;
Oh, the joy of full salvation!
Glory, glory to His Name!'], '7614spqDTTE', 'All to Jesus I surrender', 'Judson W. Van DeVenter was an American hymn writer and evangelist in the late 19th century. ''I Surrender All'' is one of his most famous hymns, emphasizing total commitment to Christ.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (3, 'Amazing Grace', 'John Newton', 'Traditional', ARRAY['Amazing grace! How sweet the sound!
That saved a wretch like me;
I once was lost, but now am found;
Was blind but now I see.','''Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear,
The hour I first believed!','Through many dangers, toils, and snares,
I have already come;
''Tis grace that brought me safe thus far,
And grace will lead me home.','When we''ve been there ten thousand years,
Bright shining as the sin,
We''ve no less days to sing God''s praise
Than when we first begun.'], 'YXd-FyGMVto', 'Amazing grace! How sweet the sound!', 'John Newton was an 18th-century English clergyman and former slave trader who became a prominent abolitionist. ''Amazing Grace'' is his most famous hymn, reflecting his profound spiritual transformation.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (4, 'Are You Washed in the Blood?', 'Elisha A. Hoffman', 'Easter', ARRAY['Have you been to Jesus for the cleansing power?
Are you washed in the blood of the lamb?
Are you fully trusting in his grace this hour?
Are you washed in the blood of the lamb?
 
Are you washed in the blood,
In the soul-cleansing of the lamb?
Are your garments spotless? Are they white as snow?
Are you washed in the blood of the lamb?','Are you walking daily by the saviour''s side?
Are you washed in the blood of the lamb?
Do you rest each time in the crucified?
Are you washed in the blood of the lamb?','When the bridegroom cometh, will you robes be white?
Are you washed in the blood of the lamb?
Will your souls be ready for the mansions bright?
Are you washed in the blood of the lamb?','Lay aside the garments that are stained with sin,
Are you washed in the blood of the lamb?
There''s a fountain flowing for the soul unclean,
Are you washed in the blood of the lamb?'], '0enMoYc6EpM', 'Have you been to Jesus for the cleansing power?', 'Elisha A. Hoffman was a 19th-century American hymn writer and evangelist. ''Are You Washed in the Blood?'' is one of his most enduring hymns, emphasizing the cleansing power of Christ''s sacrifice.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (5, 'To God Be the Glory', 'Fanny Crosby', 'Praise', ARRAY['To God be the glory, great things He hath done,
So loved He the world that He gave us His Son,
Who yielded His life an attonment for Sin,
And opened the life-gate that all may go in.
 
Praise the Lord, praise the Lord,
Let the earth hear His voice;
Praise the Lord, praise the Lord,
Let the people rejoice;
Oh, come to the Father, through Jesus the Son,
And give Him the glory! Great things He hath done.','Oh, perfect redemption, the purchase of blood,
To every believer the promise of God;
The vilest offender who truly believes,
That moment from Jesus a pardon receives.','Great things He hath taught us,
great things He hath done,
And great our rejoicing through Jesus the Son;
But purer, and higher, and greater will be
Our wonder, our transport when Jesus we see.'], 'aKMfTwxAJ4k', 'To God be the glory, great things He hath done', 'Fanny Crosby was a prolific 19th-century American hymn writer, known for her deep faith and prolific output. ''To God Be the Glory'' is one of her most famous hymns, celebrating God''s grace and salvation.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (6, 'Break Thou the Bread of Life', 'Mary A. Lathbury', 'Easter', ARRAY['Break Thou the Bread of Life,
Dear Lord, to me,
As Thou didst break the loaves
Beside the sea;
Beyond the sacred page
I seek Thee, Lord;
My Spirit pants for Thee,
O living Word.','Thou art the Bread of Life,
O Lord, to me,
Thy Holy Word the truth
That saveth me:
Give me to eat and live
With Thee above;
Teach me to love Thy truth,
For Thou art Love.','Send Thy Spirit, Lord,
Now unto me,
That He may touch my eyes,
And make me see:
Show me the truth concealed
Within Thy Word,
And in Thy Book revealed
I see the Lord.','Bless Thou the truth, dear Lord,
To me, to me,
As Thou didst bless the bread
By Galilee;
Then shall all bondage cease,
All fetters fall,
And I shall find my peace,
My all in all.'], 'euz0ot2dDY8', 'Break Thou the Bread of Life', 'Mary A. Lathbury was a 19th-century American hymn writer and social reformer. ''Break Thou the Bread of Life'' is a beloved hymn that emphasizes the importance of Scripture and spiritual nourishment.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (7, 'Above the Bright Blue', 'George S. Schuler', 'Traditional', ARRAY['There''s a beautiful place called heaven,
It is hidden above the bright blue,
Where the good, who from earth ties are riven,
Live and love an eternity through.
 
Above the bright blue, the beautiful blue,
Jesus is waiting for me and for you;
Heaven is there, not far from our sight,
Beautiful city of light.','This land of sweet rest awaits us,
Someday it will break on our view,
''Tis promised by Christ the Redeemer,
To His followers faithful and true.','We know not when He shall call us,
Whether soon, the glad summons shall be,
But we know, when we pass o''er the river,
The glory of Jesus we''ll see.'], 'PkjjZLhcQ34', 'There''s a beautiful place called heaven', 'George S. Schuler was a 20th-century hymn writer known for his uplifting and hopeful lyrics. ''Above the Bright Blue'' is a hymn that speaks of the promise of heaven and eternal life with Christ.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (8, 'Nearer, My God, to Thee', 'Sarah F. Adams', 'Worship', ARRAY['Nearer, my God, to Thee,
Nearer to Thee!
Even though it be a cross
That raiseth me;
Still all my song shall be:
"Nearer, my God, to Thee,
Near to Thee."','Though like the wanderer,
The sun gone down,
Darkness be over me,
My rest a stone:
Yet in my dreams I''d be
Nearer, my God, to Thee,
Nearer to Thee!','Then, with my waking thoughts
Bright with Thy praise,
Out of my stony grief
Bethel I''ll raise;
So, by my woes to be
Nearer, my God, to Thee,
Nearer to Thee!','Or if on joyful wing
Clearing the sky,
Sun, moon, and stars forgot,
Upwards I fly,
Still all my song shall be:
"Nearer, my God, to Thee,
Nearer to Thee!"'], 'qU4kYLe8z_U', 'Nearer, my God, to Thee', 'Sarah F. Adams was a 19th-century English poet and hymn writer. ''Nearer, My God, to Thee'' is one of her most famous hymns, expressing a deep desire for closeness to God, even in times of trial.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (9, 'No, Not One', 'Johnson Oatman Jr.', 'Traditional', ARRAY['There''s not a friend like the lowly Jesus,
No, not one! No, not one!
None else could heal all our soul''s diseases,
No, not one! No, not one!
 
Jesus knows all about our struggles
He will guide till the day is done
There''s not a friend like the lowly Jesus,
No, not one! No, not one!','No friend like him is so high and holy,
No, not one! No, not one!
And yet no friend is so meek and lowly,
No, not one! No, not one!','There''s not an hour that He is not near us,
No, not one! No, not one!
No night so dark but his love can cheer us,
No, not one! No, not one!','Did ever saint find this friend forsake him,
No, not one! No, not one!
Or sinner find that He would not take him?
No, not one! No, not one!'], 'iddd3qXiN5Y', 'There''s not a friend like the lowly Jesus', 'Johnson Oatman Jr. was a 19th-century American hymn writer known for his simple yet profound lyrics. ''No, Not One'' is a beloved hymn that emphasizes the unique friendship and support found in Jesus.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (10, 'Nothing but the Blood of Jesus', 'Robert Lowry', 'Easter', ARRAY['What can wash away my sins?
Nothing but the blood of Jesus!
What can make me whole again?
Nothing but the blood of Jesus!
 
O precious is the flow
That makes me white as snow!
No other fount I know:
Nothing but the blood of Jesus!','For my pardon this I see
Nothing but the blood of Jesus!
For my cleansing this my plea
Nothing but the blood of Jesus!','Nothing can for sin atone
Nothing but the blood of Jesus!
Naught of good that I have done
Nothing but the blood of Jesus!','This is all my hope and peace
Nothing but the blood of Jesus!
This is all my righteousness
Nothing but the blood of Jesus!'], 'WN9AEr15uNM', 'What can wash away my sins?', 'Robert Lowry was a 19th-century American Baptist minister and hymn writer. ''Nothing but the Blood of Jesus'' is one of his most famous hymns, celebrating the redemptive power of Christ''s sacrifice.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (11, 'Oh, How I Love Jesus', 'Frederick Whitfield', 'Traditional', ARRAY['There is a name I love to hear
I love to sing its worth;
It sounds like music in mine ear,
The sweetest name on earth.
 
Oh, how I love Jesus,
Oh, how I love Jesus,
Oh, how I love Jesus,
Because He first loved me!','It tells me of a saviour''s love,
Who died to set me free;
It tells me of His precious blood
The sinner''s perfect plea.','It tells me what my father has
In store for every day
And though I tread a darksome path,
Yields sunshine all the way.','It tells of one whose loving heart
Can feel my deepest woe,
Who in each sorrow bears a part,
That none can bear below.'], 'ZbFY7IzpOVs', 'There is a name I love to hear', 'Frederick Whitfield was a 19th-century English clergyman and hymn writer. ''Oh, How I Love Jesus'' is a cherished hymn that expresses deep affection for Jesus and the joy of His love.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (12, 'Keep Me Near the Cross', 'Fanny Crosby', 'Easter', ARRAY['Jesus, keep me near the Cross;
There a precious fountain,
Free to all, a healing stream,
Flows from Calvary''s Mountain.
 
In the Cross, in the Cross,
Be my glory ever;
Till my raptured soul shall find
Rest beyond the river.','Near the Cross, a trembling soul,
Love and mercy found me;
There the bright and morning star
Shed its beams around me.','Near the Cross, O Lamb of God,
Bring its scenes before me;
Help me walk from day to day
With its shadow o''er me.','Near the Cross I''ll watch and wait,
Hoping, trusting ever,
Till I reach the golden strand,
Just beyond the river.'], 'xXoNeJdH3n4', 'Jesus, keep me near the Cross', 'Fanny Crosby, a prolific 19th-century hymn writer, wrote ''Keep Me Near the Cross'' to express her desire to remain close to the sacrifice of Christ. Her hymns often reflect deep spiritual insight and devotion.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (13, 'Onward Christian Soldiers', 'Sabine Baring-Gould', 'Warship', ARRAY['Onward Christian soldiers
Marching as to war;
With the cross of Jesus,
Going on before.
Christ the loyal master,
Leads against the foe;
Forward into battle.
See his banners go. 
 
Onward Christian soldiers,
Marching as to war,
With the cross of Jesus,
Going on before.','At the sign of triumph,
Satan''s legions flee;
On then Christian soldiers,
On to victory.
Hell''s foundations quiver
At the shout of praise,
Brothers lift your voices,
Loud your anthem raise.','Like a mighty army
Moves the church of God.
Brothers, we are treading,
Where the saints have trod;
We are not divided;
All one body we,
One in the hope and doctrine,
One in charity.','Crowns and thrones may perish
Kingdoms rise and wane,
But the church of Jesus
Constant will remain;
Gates of hell can never
Against that church prevail;
We have Christ''s own promise.
We can never fail.','Onward, then, people
Join our happy throng,
Blend with ours with your voices,
In the triumph song;
Glory, laud and honour
Unto Christ our king;
This through countless ages
Men and angels sing.'], 'p3fMLYOWkO4', 'Onward Christian soldiers', 'Sabine Baring-Gould was a 19th-century English writer and hymnologist. ''Onward Christian Soldiers'' is one of his most famous hymns, emphasizing the Christian''s call to spiritual warfare and unity in Christ.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (14, 'Rock of Ages', 'Augustus Toplady', 'Praise', ARRAY['Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy riven side which flowed,
Be of sin the double cure,
Cleanse me from its guilt and power.','Not the labours of my hands
Can fulfil Thy law''s demands;
Could my zeal no respite know
Could my tears for ever flow
All for sin could not atone;
Thou must save, and Thou alone.','Nothing in my hand I bring,
Simply to Thy cross I cling;
Naked, come to Thee for dress,
Helpless, look to Thee for grace;
Foul, I to the fountain fly,
Wash me, Saviour, or I die.','While I draw this fleeing breath,
When mine eyes shall close in death,
When I soar through tracts unknown
See Thee on Thy judgment throne;
Rock of Ages, cleft for me,
Let me hide myself in Thee.'], '5hyJuuo24tY', 'Rock of Ages, cleft for me', 'Augustus Toplady was an 18th-century English Anglican cleric and hymn writer. ''Rock of Ages'' is one of his most enduring hymns, emphasizing the sufficiency of Christ''s sacrifice for salvation.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (15, 'Stand Up For Jesus', 'George Duffield Jr.', 'Worship', ARRAY['Stand up! Stand up for Jesus,
Ye soldiers of the cross!
Lift high His royal banner,
It must not suffer loss.
From victory unto victory
His army shall He lead,
Till every foe is vanquished,
And Christ is Lord indeed.','Stand up! Stand up for Jesus,
The trumpet call obey;
Forth to the mighty conflict
In this His glorious day.
Ye that are His now serve Him
Against unnumbered foes;
Let courage rise with danger,
And strength to strength oppose.','Stand up! Stand up for Jesus,
Stand in His strength alone!
The arm of flesh will fail you;
Ye dare not trust your own.
Put on the Gospel armour,
And, watching unto prayer,
Where duty calls, or danger,
Be never wanting there.','Stand up! Stand up for Jesus,
The strife will not be long!
This day the noise of battle,
The next the victor''s song;
To him that overcometh
A crown of life shall be;
He, with the King of Glory,
Shall reign eternally.'], 'wgRudMZvrjA', 'Stand up! Stand up for Jesus', 'George Duffield Jr. was a 19th-century American pastor and hymn writer. ''Stand Up for Jesus'' is a powerful call to Christian action and commitment, encouraging believers to stand firm in their faith.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (16, 'Sweet By And By', 'Sanford F. Bennett', 'Traditional', ARRAY['There''s a land that is fairer than day,
And by faith we can see it afar;
For the Father waits over the way
To prepare us a dwelling place there.
 
In the sweet by and by,
We shall meet on that beautiful shore;
In the sweet by and by
We shall meet on that beautiful shore.','We shall sing on that beautiful shore
The melodious songs of the blest,
And our spirits shall sorrow no more,
Not a sigh for the blessing of rest.','To our bountiful Father above
We will offer our tribute of praise
For the glorious gift of His love
And the blessings that hallow our days.'], 'Ciw3d6oUYAU', 'There''s a land that is fairer than day', 'Sanford F. Bennett was a 19th-century American hymn writer. ''Sweet By and By'' is a beloved hymn that expresses hope and anticipation for the eternal life promised to believers, emphasizing the joy of reunion in heaven.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (17, 'Blessed Assurance', 'Fanny Crosby', 'Traditional', ARRAY['Blessed assurance—Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God;
Born of His Spirit, washed in His blood.
 
 This is my story, this is my song,
Praising my Saviour all the day long;
This is my story, this is my song,
Praising my Saviour all the day long.','Perfect submission, perfect delight,
Visions of rapture now burst on my sight;
Angels descending, bring from above
Echoes of mercy, whispers of love.','Perfect submission, all is at rest,
I in my Saviour am happy and blest;
Watching and waiting, looking above,
Filled with His goodness, lost in His love.'], 'ZaAUugfVVO8', 'Blessed assurance—Jesus is mine!', 'Fanny Crosby, a prolific 19th-century hymn writer, wrote ''Blessed Assurance'' to express her deep faith and confidence in Christ. The hymn is one of her most famous works, celebrating the joy of salvation and assurance in Jesus.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (18, 'Trust And Obey', 'John H. Sammis', 'Warship', ARRAY['When we walk with the Lord
In the light of His Word,
What a glory He sheds on our way!
While we do His good will,
He abides with us still,
And with all who will trust and obey.
 
 Trust and obey,
For there''s no other way
To be happy in Jesus
But to trust and obey.','Not a shadow can rise,
Not a cloud in the skies,
But His smile quickly drives it away;
Not a doubt or a fear,
Not a sigh or a tear,
Can abide while we trust and obey.','Not a burden we bear,
Not a sorrow we share,
But our toil He doth richly repay;
Not a grief or a loss,
Not a frown or a cross,
But is blessed if we trust and obey.','But we never can prove
The delights of His love
Until all on the altar we lay;
For the favor He shows,
For the joy He bestows,
Are for them who will trust and obey.','Then in fellowship sweet
We will sit at His feet,
Or we''ll walk by His side in the way;
What He says we will do,
Where He sends, we will go—
Never fear, only trust and obey.'], 'n4U-yx6cFb0', 'When we walk with the Lord', 'John H. Sammis was a 19th-century American Presbyterian minister and hymn writer. ''Trust and Obey'' is one of his most well-known hymns, emphasizing the importance of faith and obedience in the Christian life.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (19, 'What A Friend We Have In Jesus', 'Joseph M. Scriven', 'Friendship', ARRAY['What a Friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
O what peace we often forfeit,
O what needless pain we bear,
All because we do not carry
Everything to God in prayer!','Have we trials and temptations?
Is there trouble anywhere?
We should never be discouraged—
Take it to the Lord in prayer.
Can we find a friend so faithful,
Who will all our sorrows share?
Jesus knows our every weakness—
Take it to the Lord in prayer.','Are we weak and heavy-laden,
Cumbered with a load of care?
Precious Saviour, still our refuge—
Take it to the Lord in prayer.
Do thy friends despise, forsake thee?
Take it to the Lord in prayer!
In His arms He''ll take and shield thee,
Thou wilt find a solace there.'], 'LarFhGeE-ac', 'What a Friend we have in Jesus', 'Joseph M. Scriven was a 19th-century Irish poet and hymn writer. ''What a Friend We Have in Jesus'' is one of his most beloved hymns, emphasizing the comfort and solace found in Jesus as a friend and intercessor.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (20, 'It Is Well With My Soul', 'Horatio G. Spafford', 'Peace', ARRAY['When peace like a river attendeth my way,
When sorrows like sea billows roll—
Whatever my lot, Thou hast taught me to say,
"It is well, it is well with my soul!"
 
It is well (it is well), with my soul (with my soul);
It is well, it is well with my soul.','Though Satan should buffet, though trials should come,
Let this blest assurance control:
That Christ hath regarded my helpless estate,
And hath shed His own blood for my soul.','My sin—O the bliss of this glorious thought!—
My sin, not in part, but the whole,
Is nailed to His cross, and I bear it no more:
Praise the Lord, praise the Lord, O my soul!','And Lord, haste the day when my faith shall be sight,
The clouds be rolled back as a scroll;
The trump shall resound, and the Lord shall descend:
Even so—it is well with my soul.'], 'ZYrL9ea1XUg', 'When peace like a river attendeth my way', 'Horatio G. Spafford was a 19th-century American lawyer and Presbyterian church elder. ''It Is Well With My Soul'' was written after a series of personal tragedies, expressing profound faith and peace in the midst of sorrow.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (21, 'Bringing In The Sheaves', 'Knowles Shaw', 'Harvest', ARRAY['Sowing in the morning, sowing seeds of kindness,
Sowing in the noontide and the dewy eve;
Waiting for the harvest, and the time of reaping,
We shall come rejoicing, bringing in the sheaves!
 
Bringing in the sheaves, bringing in the sheaves,
We shall come rejoicing, bringing in the sheaves;
Bringing in the sheaves, bringing in the sheaves,
We shall come rejoicing, bringing in the sheaves.','Sowing in the sunshine, sowing in the shadows,
Fearing neither clouds nor winter''s chilling breeze;
By and by the harvest, and the labor ended,
We shall come rejoicing, bringing in the sheaves!','Going forth with weeping, sowing for the Master,
Though the loss sustained our spirit often grieves;
When our weeping''s over, He will bid us welcome—
We shall come rejoicing, bringing in the sheaves!
'], 'xYagTrjtpPE', 'Sowing in the morning, sowing seeds of kindness', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (22, 'Jesus Loves Me', 'Anna B. Warner', 'Children', ARRAY['Jesus loves me! This I know,
For the Bible tells me so;
Little ones to Him belong
They are weak, but He is strong.
 
 Yes Jesus loves me!
Yes Jesus loves me!
Yes Jesus loves me!
The Bible tells me so.','Jesus loves me! He who died,
Heaven''s gate to open wide;
He will wash away my sin,
Let His little child come in.','Jesus loves me! He will stay
Close beside me all the way;
Thou hast bled and died for me,
I will henceforth live for Thee.'], 'AblWldpYfXg', 'Jesus loves me! This I know', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (23, 'The Solid Rock', 'Edward Mote', 'Faith', ARRAY['My hope is built on nothing less
Than Jesus'' blood and righteousness;
I dare not trust the sweetest frame,
But wholly lean on Jesus'' name. 
 
On Christ, the solid rock, I stand;
All other ground is sinking sand;
All other ground is sinking sand.','When darkness veils His lovely face,
I rest on His unchanging grace;
In every high and stormy gale,
My anchor holds within the veil.','His oath, His covenant, His blood,
Support me in the whelming flood;
When all around my soul gives way,
He then is all my hope and stay.','When He shall come with trumpet sound,
O may I then in Him be found,
Clothed in His righteousness alone,
Faultless to stand before the throne.'], '4p4OrSEPGvI', 'My hope is built on nothing less', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (24, 'There''s Power In The Blood', 'Lewis E. Jones', 'Salvation', ARRAY['Would you be free from your burden of sin?
There''s pow''r in the blood, pow''r in the blood;
Would you o''er evil a victory win?
There''s wonderful pow''r in the blood.
 
There''s pow''r, pow''r, Wonder-working pow''r
In the blood of the Lamb;
There''s pow''r, pow''r, Wonder-working pow''r
In the precious blood of the Lamb.','Would you be free from your passion and pride?
There''s pow''r in the blood, pow''r in the blood;
Come for a cleansing to Calvary''s tide—
There''s wonderful pow''r in the blood.','Would you be whiter, much whiter than snow?
There''s pow''r in the blood, pow''r in the blood;
Sin-stains are lost in its life-giving flow—
There''s wonderful pow''r in the blood.','Would you do service for Jesus your King?
There''s pow''r in the blood, pow''r in the blood;
Would you live daily His praises to sing?
There''s wonderful pow''r in the blood.'], 'SeTE0W7K4sU', 'Would you be free from your burden of sin?', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (25, 'Count Your Blessings', 'Johnson Oatman Jr.', 'Gratitude', ARRAY['When upon life''s billows you are tempest-tossed,
When you are discouraged, thinking all is lost,
Count your many blessings, name them one by one,
And it will surprise you what the Lord hath done.
 
Count your blessings, name them one by one,
Count your blessings, see what God hath done;
Count your blessings, name them one by one,
Count your many blessings, see what God hath done.','Are you ever burdened with a load of care?
Does the cross seem heavy you are called to bear?
Count your many blessings, every doubt will fly,
And you will keep singing as the days go by.','When you look at others with their lands and gold,
Think that Christ has promised you His wealth untold;
Count your many blessings—wealth can never buy
Your reward in heaven, nor your home on high.'], '392T7WCz3kU', 'When upon life''s billows you are tempest-tossed', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (26, 'Be With Me Lord', 'Thomas O. Chisholm', 'Guidance', ARRAY['Be with me, Lord, I cannot live without Thee,
I dare not try to take one step alone,
I cannot bear the loads of life, unaided,
I need Thy strength to lean myself upon.','Be with me, Lord, and then if dangers threaten,
If storms of trial burst above my head,
If lashing seas leap ev''rywhere about me,
They cannot harm, or make my heart afraid.','Be with me, Lord! No other gift or blessing
Thou couldst bestow could with this one compare—
A constant sense of Thy abiding presence,
Where''er I am, to feel that Thou art near.','Be with me, Lord, when loneliness o''ertakes me,
When I must weep amid the fires of pain,
And when shall come the hour of "my departure"
For "worlds unknown," O Lord, be with me then.'], 'vgPgQ_yHqG4', 'Be with me, Lord, I cannot live without Thee', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (27, 'When We All Get To Heaven', 'Eliza E. Hewitt', 'Heaven', ARRAY['Sing the wondrous love of Jesus,
Sing His mercy and His grace;
In the mansions bright and blessed
He''ll prepare for us a place.
 
When we all get to heaven,
What a day of rejoicing that will be!
When we all see Jesus,
We''ll sing and shout the victory!','While we walk the pilgrim pathway,
Clouds will overspread the sky;
But when trav''ling days are over,
Not a shadow, not a sigh.','Let us then be true and faithful,
Trusting, serving every day;
Just one glimpse of Him in glory
Will the toils of life repay.'], 'uEexjjSkCV8', 'Sing the wondrous love of Jesus', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (28, 'Kneel At The Cross', 'Charles E. Moody', 'Invitation', ARRAY['Kneel at the cross,
Christ will meet you there,
Come while He waits for you;
List to His voice,
Leave with Him your care,
And begin life anew. 
 
Kneel at the cross,
Leave every care,
Kneel at the cross,
Jesus will meet you there.','Kneel at the cross,
There is room for all
Who would His glory share;
Bliss there awaits,
Harm can ne''er befall
Those who are anchored there.','Kneel at the cross,
Give your idols up,
Look unto realms above;
Turn not away
To life''s sparkling cup—
Trust only in His love.'], 'F9g6VJwG2ks', 'Kneel at the cross', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (29, 'You Overcame', 'Jon Egan', 'Victory', ARRAY['Seated above, enthroned in the Father''s love
Destined to die, poured out for all mankind
God''s only Son
Perfect and spotless One
He never sinned
But suffered as if He did
 
 All authority
Every victory is Yours
Savior, worthy of honor and glory
Worthy of all our praise
You overcame 
 
Jesus, awesome in power forever
Awesome and great is Your name
You overcame','Power in hand
Speaking the Father''s plan
You''re sending us out
Light in this broken land','We will overcome
By the blood of the Lamb
And the word of our testimony
Everyone overcome'], 'rP_XATZQ8sU', 'Seated above, enthroned in the Father''s love', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (30, 'You Are The Song', 'Doug Moody', 'Worship', ARRAY['You are the words and the music.
You are the song that I sing.
You are the melody. You are the harmony.
Praise to Your name, I will bring.
 
You are the Lord of lords.
You are the Mighty God.
You are the King of all kings.
So now I give back to You
the song that You gave to me.
You are the song that I sing.','You are the words and the music.
You are the song that I sing.
You are the melody. You are the harmony.
Praise to Your name, I will bring.'], '9_szFKZOg48', 'You are the words and the music', NULL) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (31, 'He Gave Me A Song', 'Lizzie De Armond', 'Joy', ARRAY['He took my burdens all away, up to a brighter day,
He gave me a song, a wonderful song;
A wonderful song I now can sing, in my heart joy bells ring,
He gave me a song a wonderful song.
 

He gave me a song to sing about,
He lifted me from sin and doubt,
Oh, praise His name! He is my King.
A wonderful song, He is to me.','Brighter the way grows ev''ry day, walking the heav''nly way,
He gave me a song, a wonderful song;
A wonderful song I now can sing, praises to Him, my King,
He gave me a song, a wonderful song.','I am redeemed no more to die, never to say "goodbye,"
He gave me a song, a wonderful song;
And some of these days in that fair land, sing with the chorus grand,
He gave me a song, a wonderful song.'], 'hD6qKikbaL4', 'He took my burdens all away', 'Lizzie De Armond was a 20th-century American hymn writer known for her joyful and uplifting lyrics. ''He Gave Me A Song'' reflects her deep faith and the joy of salvation, celebrating the song of praise given by God.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (32, 'When the Roll Is Called Up Yonder', 'James M. Black', 'Assurance', ARRAY['When the trumpet of the Lord shall sound and time shall be no more,
And the morning breaks, eternal, bright and fair;
When the saved of earth shall gather over on the other shore,
And the roll is called up yonder, I''ll be there.
 
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder,
When the roll is called up yonder, I''ll be there.','On that bright and cloudless morning when the dead in Christ shall rise,
And the glory of his resurrection share;
When his chosen ones shall gather to their home beyond the skies,
And the roll is called up yonder, I''ll be there.','Let us labor for the Master from the dawn till setting sun;
Let us talk of all his wondrous love and care.
Then when all of life is over and our work on earth is done,
And the roll is called up yonder, I''ll be there.'], '9QfQoUtuV5w', 'When the trumpet of the Lord shall sound', 'James Milton Black (1856–1938) was an American hymnwriter and Methodist lay leader. He wrote this hymn in 1893 after a Sunday school student''s absence prompted him to reflect on the heavenly roll call. The hymn became one of the most popular gospel songs of the 20th century.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (33, 'Lily of the Valley', 'Charles W. Fry', 'Assurance', ARRAY['I have found a friend in Jesus,
He''s ev''rything to me,
He''s the fairest of ten thousand to my soul;
The "Lily of the Valley," in Him alone I see,
all I need to cleanse and make me fully whole.
In sorrow He''s my comfort, in trouble He''s my stay,
He tells me ev''ry care on Him to roll;
He''s the "Lily of the Valley, the Bright and Morning Star,"
He''s the fairest of ten thousand to my soul.','He all my grief has taken, and all my sorrows borne,
in temptation He''s my strong and mighty tow''r;
I have all for Him forsaken, and all my idols torn
from my heart, and now He keeps me by His pow''r.
Though all the world forsake me, and Satan tempt me sore,
through Jesus I shall safely reach the goal;
He''s the "Lily of the Valley, the Bright and Morning Star,"
He''s the fairest of ten thousand to my soul.','He will never, never leave me, nor yet forsake me here,
while I live by faith and do His blessed will;
A wall of fire about me, I''ve nothing now to fear,
with His manna He my hungry soul shall fill.
Then sweeping up to glory, to see His blessed face,
where rivers of delight shall ever roll;
He''s the "Lily of the Valley, the Bright and Morning Star,"
He''s the fairest of ten thousand to my soul.'], 'PaLLWd-BBpo', 'I have found a friend in Jesus', 'Charles William Fry (1837-1882) was a British Salvation Army officer and musician. He composed this beloved hymn in 1881 while leading the Salvation Army band. The hymn beautifully expresses Christ''s comfort and sufficiency using imagery from Song of Solomon 2:1.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (34, 'Great Is Thy Faithfulness', 'Thomas Chisholm', 'Faithfulness', ARRAY['Great is Thy faithfulness, O God my Father
There is no shadow of turning with Thee
Thou changest not, Thy compassions, they fail not
As Thou hast been, Thou forever will be
 
Great is Thy faithfulness!
Great is Thy faithfulness!
Morning by morning new mercies I see
All I have needed Thy hand hath provided
Great is Thy faithfulness, Lord, unto me!','Summer and winter and springtime and harvest
Sun, moon and stars in their courses above
Join with all nature in manifold witness
To Thy great faithfulness, mercy and love','Pardon for sin and a peace that endureth
Thine own dear presence to cheer and to guide
Strength for today and bright hope for tomorrow
Blessings all mine, with ten thousand beside'], 'Soh9WKhmZa4', 'Great is Thy faithfulness, O God my Father', 'Thomas Chisholm was a 20th-century American hymn writer. ''Great Is Thy Faithfulness'' (1923) celebrates God''s unchanging character, inspired by Lamentations 3:22-23. Though written during financial hardship, it expresses profound trust in God''s provision.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (35, 'How Great Thou Art', 'Carl Boberg', 'Worship', ARRAY['O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power throughout the universe displayed
 
Then sings my soul, my Saviour God to Thee
How great Thou art, how great Thou art!','When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees
When I look down from lofty mountain grandeur
And hear the brook and feel the gentle breeze','And when I think that God, His Son not sparing
Sent Him to die, I scarce can take it in
That on the cross, my burden gladly bearing
He bled and died to take away my sin','When Christ shall come with shout of acclamation
And take me home, what joy shall fill my heart
Then I shall bow in humble adoration
And there proclaim, ''My God, how great Thou art!'''], 'BllDD7zpHbg', 'O Lord my God, when I in awesome wonder', 'Carl Boberg was a Swedish poet and minister. Originally written in Swedish in 1885 as ''O Store Gud'', this hymn gained global popularity through English translations. Its majestic lyrics reflect on creation, redemption, and Christ''s return.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (36, 'Holy, Holy, Holy', 'Reginald Heber', 'worship', ARRAY['Holy, holy, holy! Lord God Almighty!
Early in the morning our song shall rise to Thee
Holy, holy, holy! Merciful and mighty!
God in three Persons, blessed Trinity!','Holy, holy, holy! All the saints adore Thee
Casting down their golden crowns around the glassy sea
Cherubim and seraphim falling down before Thee
Which wert, and art, and evermore shalt be','Holy, holy, holy! Though the darkness hide Thee
Though the eye of sinful man Thy glory may not see
Only Thou art holy; there is none beside Thee
Perfect in pow''r, in love, and purity','Holy, holy, holy! Lord God Almighty!
All Thy works shall praise Thy name in earth and sky and sea
Holy, holy, holy! Merciful and mighty!
God in three Persons, blessed Trinity!'], 'lsQQRZaTerE', 'Holy, holy, holy! Lord God Almighty!', 'Reginald Heber was an early 19th-century English bishop. Written in 1826, this hymn is considered the standard English-language hymn on the Trinity. Its lyrics draw from Revelation 4:8-11 and emphasize God''s supreme holiness.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (37, 'Be Thou My Vision', 'Ancient Irish, tr. Mary Byrne', 'Devotion', ARRAY['Be Thou my vision, O Lord of my heart
Naught be all else to me, save that Thou art
Thou my best thought, by day or by night
Waking or sleeping, Thy presence my light','Be Thou my wisdom, and Thou my true word
I ever with Thee and Thou with me, Lord
Thou my great Father, I Thy true son
Thou in me dwelling, and I with Thee one','Riches I heed not, nor man''s empty praise
Thou mine inheritance, now and always
Thou and Thou only, first in my heart
High King of heaven, my treasure Thou art','High King of heaven, my victory won
May I reach heaven''s joys, O bright heav''n''s Sun
Heart of my own heart, whatever befall
Still be my vision, O Ruler of all'], 'N96n0L8ddM0', 'Be Thou my vision, O Lord of my heart', 'This 8th-century Irish hymn was translated by Mary Byrne in 1905 and versified by Eleanor Hull in 1912. Originally ''Rop tú mo Baile'', it reflects ancient Celtic Christianity''s emphasis on Christ''s intimate presence in daily life.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (38, 'The Old Rugged Cross', 'George Bennard', 'Salvation', ARRAY['On a hill far away stood an old rugged cross
The emblem of suffering and shame
And I love that old cross where the dearest and best
For a world of lost sinners was slain
 
So I''ll cherish the old rugged cross
Till my trophies at last I lay down
I will cling to the old rugged cross
And exchange it some day for a crown','O that old rugged cross, so despised by the world
Has a wondrous attraction for me
For the dear Lamb of God left His glory above
To bear it to dark Calvary','In that old rugged cross, stained with blood so divine
A wondrous beauty I see
For ''twas on that old cross Jesus suffered and died
To pardon and sanctify me','To the old rugged cross I will ever be true
Its shame and reproach gladly bear
Then He''ll call me some day to my home far away
Where His glory forever I''ll share'], 'i7v26yrlz5w', 'On a hill far away stood an old rugged cross', 'George Bennard was an American evangelist who wrote this hymn in 1913. Inspired by his struggles during ministry, it became one of the most beloved American gospel hymns, emphasizing the paradox of Christ''s shameful cross bringing salvation.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (39, 'I Need Thee Every Hour', 'Annie Hawks', 'Dependence', ARRAY['I need Thee every hour, most gracious Lord
No tender voice like Thine can peace afford
 
I need Thee, O I need Thee
Every hour I need Thee
O bless me now, my Saviour
I come to Thee','I need Thee every hour, stay Thou nearby
Temptations lose their pow''r when Thou art nigh','I need Thee every hour, in joy or pain
Come quickly and abide, or life is vain','I need Thee every hour, teach me Thy will
And Thy rich promises in me fulfill'], 'K03qGVMdN18', 'I need Thee every hour, most gracious Lord', 'Annie Hawks was a 19th-century American homemaker and hymn writer. She composed this hymn in 1872 during routine housework when struck by her constant need for God''s presence. The refrain was added by her pastor Robert Lowry.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (40, 'Come, Thou Fount of Every Blessing', 'Robert Robinson', 'Grace', ARRAY['Come, Thou Fount of every blessing
Tune my heart to sing Thy grace
Streams of mercy, never ceasing
Call for songs of loudest praise
Teach me ever to adore Thee
May I still Thy goodness prove
While the hope of endless glory
Fills my heart with joy and love','Here I raise my Ebenezer
Hither by Thy help I''ve come
And I hope, by Thy good pleasure
Safely to arrive at home
Jesus sought me when a stranger
Wandering from the fold of God
He, to rescue me from danger
Interposed His precious blood','O to grace how great a debtor
Daily I''m constrained to be
Let Thy goodness, like a fetter
Bind my wandering heart to Thee
Prone to wander, Lord, I feel it
Prone to leave the God I love
Here''s my heart, O take and seal it
Seal it for Thy courts above'], 'llPoc5wAgYQ', 'Come, Thou Fount of every blessing', 'Robert Robinson was an 18th-century English dissident minister. Written at age 22 in 1758, this hymn reflects his conversion after hearing George Whitefield preach. The ''Ebenezer'' reference comes from 1 Samuel 7:12, meaning ''stone of help''.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (41, 'Victory in Jesus', 'E.M. Bartlett', 'Victory', ARRAY['I heard an old, old story
How a Saviour came from glory
How He gave His life on Calvary
To save a wretch like me
I heard about His groaning
Of His precious blood''s atoning
Then I repented of my sins
And won the victory
 
O victory in Jesus
My Saviour forever
He sought me and bought me
With His redeeming blood
He loved me ere I knew Him
And all my love is due Him
He plunged me to victory
Beneath the cleansing flood','I heard about His healing
Of His cleansing pow''r revealing
How He made the lame to walk again
And caused the blind to see
And then I cried, ''Dear Jesus
Come and heal my broken spirit''
And somehow Jesus came and brought
To me the victory','I heard about a mansion
He has built for me in glory
And I heard about the streets of gold
Beyond the crystal sea
About the angels singing
And the old redemption story
And some sweet day I''ll sing up there
The song of victory'], 'R3wYarmL6xM', 'I heard an old, old story', 'E.M. Bartlett was a 20th-century American gospel songwriter. Written in 1939, this hymn became a Southern gospel standard. Its testimony-style lyrics describe conversion, healing, and the hope of heaven through Christ''s victory.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (42, 'Because He Lives', 'Bill & Gloria Gaither', 'Assurance', ARRAY['God sent His son, they called Him Jesus
He came to love, heal and forgive
He lived and died to buy my pardon
An empty grave is there to prove my Saviour lives
 
Because He lives I can face tomorrow
Because He lives all fear is gone
Because I know He holds the future
And life is worth the living just because He lives','How sweet to hold a newborn baby
And feel the pride and joy he gives
But greater still the calm assurance
This child can face uncertain days because He lives','And then one day I''ll cross the river
I''ll fight life''s final war with pain
And then as death gives way to victory
I''ll see the lights of glory and I''ll know He reigns'], 'adKzNr6G2os', 'God sent His son, they called Him Jesus', 'Bill and Gloria Gaither are influential 20th-century American gospel songwriters. They wrote this hymn in 1971 during personal struggles, including Gloria''s difficult pregnancy. It emphasizes Christ''s resurrection as the foundation for daily hope.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (43, 'Leaning on the Everlasting Arms', 'Elisha Hoffman', 'Security', ARRAY['What a fellowship, what a joy divine
Leaning on the everlasting arms
What a blessedness, what a peace is mine
Leaning on the everlasting arms
 
Leaning, leaning
Safe and secure from all alarms
Leaning, leaning
Leaning on the everlasting arms','O how sweet to walk in this pilgrim way
Leaning on the everlasting arms
O how bright the path grows from day to day
Leaning on the everlasting arms','What have I to dread, what have I to fear
Leaning on the everlasting arms
I have blessed peace with my Lord so near
Leaning on the everlasting arms'], 'lneA46frKT4', 'What a fellowship, what a joy divine', 'Elisha Hoffman was a 19th-century American hymn writer. Published in 1887 with music by Anthony Showalter, this hymn gained popularity in rural revivals. Its theme of divine security comes from Deuteronomy 33:27 - ''The eternal God is your refuge.''') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (44, 'Just As I Am', 'Charlotte Elliott', 'Invitation', ARRAY['Just as I am, without one plea
But that Thy blood was shed for me
And that Thou bidst me come to Thee
O Lamb of God, I come, I come','Just as I am, and waiting not
To rid my soul of one dark blot
To Thee whose blood can cleanse each spot
O Lamb of God, I come, I come','Just as I am, though tossed about
With many a conflict, many a doubt
Fightings and fears within, without
O Lamb of God, I come, I come','Just as I am, Thou wilt receive
Wilt welcome, pardon, cleanse, relieve
Because Thy promise I believe
O Lamb of God, I come, I come'], 'XOEtLtpCXP8', 'Just as I am, without one plea', 'Charlotte Elliott was a 19th-century English poet. Written in 1835 during a spiritual crisis, this hymn became the signature invitation song for Billy Graham crusades. Its message of coming to Christ without preconditions has made it a global standard.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (45, 'Praise to the Lord, the Almighty', 'Joachim Neander', 'Praise', ARRAY['Praise to the Lord, the Almighty, the King of creation
O my soul, praise Him, for He is thy health and salvation
All ye who hear, now to His temple draw near
Praise Him in glad adoration','Praise to the Lord, who o''er all things so wondrously reigneth
Shelters thee under His wings, yea, so gently sustaineth
Hast thou not seen how thy desires e''er have been
Granted in what He ordaineth?','Praise to the Lord, who doth prosper thy work and defend thee
Surely His goodness and mercy here daily attend thee
Ponder anew what the Almighty can do
If with His love He befriend thee'], 'JVwxHmXHp68', 'Praise to the Lord, the Almighty, the King of creation', 'Joachim Neander was a 17th-century German Reformed teacher. Written in 1680, this hymn adapts Psalms 103 and 150. Neander often wrote in a valley near Düsseldorf now named Neanderthal, where the famous fossils were later discovered.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (46, 'A Mighty Fortress Is Our God', 'Martin Luther', 'Reformation', ARRAY['A mighty fortress is our God
A bulwark never failing
Our helper He amid the flood
Of mortal ills prevailing
For still our ancient foe
Doth seek to work us woe
His craft and pow''r are great
And armed with cruel hate
On earth is not his equal','Did we in our own strength confide
Our striving would be losing
Were not the right man on our side
The man of God''s own choosing
Dost ask who that may be?
Christ Jesus, it is He
Lord Sabaoth His name
From age to age the same
And He must win the battle','And though this world with devils filled
Should threaten to undo us
We will not fear for God hath willed
His truth to triumph through us
The prince of darkness grim
We tremble not for him
His rage we can endure
For lo, his doom is sure
One little word shall fell him','That word above all earthly pow''rs
No thanks to them abideth
The Spirit and the gifts are ours
Through Him who with us sideth
Let goods and kindred go
This mortal life also
The body they may kill
God''s truth abideth still
His kingdom is forever'], 'rNXxkVuwxY0', 'A mighty fortress is our God', 'Martin Luther was the 16th-century German Reformer. Based on Psalm 46, this hymn (c. 1529) became the battle cry of the Protestant Reformation. Its powerful lyrics declare God''s protection against spiritual and earthly enemies.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (47, 'Abide With Me', 'Henry Lyte', 'Comfort', ARRAY['Abide with me: fast falls the eventide
The darkness deepens; Lord, with me abide
When other helpers fail and comforts flee
Help of the helpless, O abide with me','Swift to its close ebbs out life''s little day
Earth''s joys grow dim, its glories pass away
Change and decay in all around I see
O Thou who changest not, abide with me','I need Thy presence every passing hour
What but Thy grace can foil the tempter''s pow''r?
Who like Thyself my guide and stay can be?
Through cloud and sunshine, Lord, abide with me','Hold Thou Thy cross before my closing eyes
Shine through the gloom and point me to the skies
Heav''n''s morning breaks and earth''s vain shadows flee
In life, in death, O Lord, abide with me'], '1wS0o7HMJiQ', 'Abide with me: fast falls the eventide', 'Henry Lyte was a 19th-century Anglican priest. Written in 1847 as he lay dying of tuberculosis, this hymn has been sung at British royal events and global memorial services. Its evening imagery poignantly expresses trust in Christ''s constant presence.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (48, 'Shall We Gather at the River', 'Robert Lowry', 'Hope', ARRAY['Shall we gather at the river
Where bright angel feet have trod
With its crystal tide forever
Flowing by the throne of God?
 
Yes, we''ll gather at the river
The beautiful, the beautiful river
Gather with the saints at the river
That flows by the throne of God','On the margin of the river
Washing up its silver spray
We will walk and worship ever
All the happy golden day','Ere we reach the shining river
Lay we ev''ry burden down
Grace our spirits will deliver
And provide a robe and crown','Soon we''ll reach the shining river
Soon our pilgrimage will cease
Soon our happy hearts will quiver
With the melody of peace'], 'vSQD0Bz8sWI', 'Shall we gather at the river', 'Robert Lowry was a 19th-century American Baptist minister. Inspired by Revelation 22:1, he wrote both words and music in 1864 during a heatwave. This hymn became particularly popular in camp meetings and outdoor revivals.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (49, 'In the Garden', 'C. Austin Miles', 'Hope', ARRAY['I come to the garden alone
While the dew is still on the roses
And the voice I hear falling on my ear
The Son of God discloses
 
And He walks with me
And He talks with me
And He tells me I am His own
And the joy we share as we tarry there
None other has ever known','He speaks, and the sound of His voice
Is so sweet the birds hush their singing
And the melody that He gave to me
Within my heart is ringing','I''d stay in the garden with Him
Though the night around me be falling
But He bids me go; through the voice of woe
His voice to me is calling'], 'i9LxvTZy5gE', 'I come to the garden alone', 'C. Austin Miles was a 20th-century American pharmacist and hymn writer. Claiming divine inspiration, he wrote this hymn in 1912 after meditating on Mary Magdalene''s encounter with the risen Christ (John 20). Its personal devotion style made it hugely popular.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (50, 'Turn Your Eyes Upon Jesus', 'Helen Lemmel', 'Focus', ARRAY['O soul, are you weary and troubled?
No light in the darkness you see?
There''s light for a look at the Saviour
And life more abundant and free
 
Turn your eyes upon Jesus
Look full in His wonderful face
And the things of earth will grow strangely dim
In the light of His glory and grace','Through death into life everlasting
He passed, and we follow Him there
O''er us sin no more hath dominion
For more than conqu''rors we are!','His word shall not fail you—He promised
Believe Him, and all will be well
Then go to a world that is dying
His perfect salvation to tell!'], 'POyfmQ-hl24', 'O soul, are you weary and troubled?', 'Helen Lemmel was a 20th-century British-American hymn writer. Inspired by a tract titled ''Focused'' in 1918, she wrote this hymn during a period of personal crisis and blindness. Its call to Christ-centered perspective remains profoundly relevant.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (51, 'You Are My All in All', 'Dennis Jernigan', 'Worship', ARRAY['You are my Strength
When I am weak.
You are the Treasure
That I seek.
You are my All in all.
Seeking You
As a precious Jewel,
Lord to give up
I''d be a fool.
You are my All in all!
 
Jesus, Lamb of God,
Worthy is Your Name.
Jesus, Lamb of God,
Worthy is Your Name.','Taking my cross,
My sin my shame,
Rising again
I praise Your Name.
You are my All in all.
When I fall down
You lift me up.
When I am dry
You fill my cup.
You are my All in all.','When the dark powers
Had done their worst
Jesus brought victory
O''er the curse.
You are my All in all.
Death could not
Hold the King of kings.
Now to His heirs
New life He brings.
You are my All in all.'], '_PLOadX6NqQ', 'You are my Strength', 'Dennis Jernigan was born in 1959 in Sapulpa, Oklahoma. A prolific contemporary Christian songwriter, he has written hundreds of songs including widely-sung worship songs like ''We Will Worship the Lamb of Glory'', ''Thank You'', and ''You Are My All in All''. Having been active since the early 1990s, Jernigan sees himself not as a songwriter but as a song ''receiver'', and has dedicated much of his life to setting the spiritually captive free.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (52, 'Send the Light', 'Charles H. Gabriel', 'Missions', ARRAY['There''s a call comes ringing o''er the restless wave:
"Send the light! Send the light!"
There are souls to rescue, there are souls to save.
Send the light! Send the light!
 
Send the light, the blessed gospel light.
Let it shine from shore to shore.
Send the light, the blessed Gospel light.
Let it shine forevermore.','We have heard the Macedonian call today:
"Send the light! Send the light!"
And a golden off''ring at the cross we lay,
Send the light! Send the light!','Let us pray that grace may ev''rywhere abound;
Send the light! Send the light!
And a Christ-like spirit ev''rywhere be found.
Send the light! Send the light!','Let us not grow weary in the work of love.
Send the light! Send the light!
Let us gather jewels for a crown above.
Send the light! Send the light!'], 'Xp4ArRKsKx0', 'There''s a call comes ringing o''er the restless wave', 'Charles H. Gabriel was a prolific 19th-20th century American gospel songwriter and composer. ''Send the Light'' emphasizes the missionary call to spread the gospel throughout the world, inspired by the Macedonian call in Acts 16:9.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (53, 'Sing to Me of Heaven', 'Ada Powell', 'Heaven', ARRAY['Sing to me of heaven, sing that song of peace,
From the toils that bind me it will bring release;
Burdens will be lifted that are pressing so,
Showers of great blessing o''er my heart will flow.
 
Sing to me of heaven, let me fondly dream
Of its golden glory, of its pearly gleam;
Sing to me when shadows of the evening fall,
Sing to me of heaven, Sweetest song of all.','Sing to me of heaven, as I walk alone,
Dreaming of the comrades that so long have gone;
In a fairer region, ''mong the angel throng,
They are happy as they sing that old, sweet song.','Sing to me of heaven, tenderly and low,
Till the shadows o''er me rise and swiftly go;
When my heart is weary, when the day is long,
Sing to me of heaven, sing that old, sweet song.'], 'b2be9VfUsGo', 'Sing to me of heaven, sing that song of peace', 'Ada Powell was a 19th-century hymn writer. ''Sing to Me of Heaven'' offers comfort through its gentle meditation on the hope of heaven, particularly meaningful during times of weariness and loss.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (54, 'This World Is Not My Home', 'Anonymous', 'Heaven', ARRAY['This world is not my home, I''m just a passing through
My treasures are laid up somewhere beyond the blue;
The angels beckon me from heaven''s open door,
And I can''t feel at home in this world anymore.
 
O Lord, you know I have no friend like you,
If heaven''s not my home, then Lord what will I do?
The angels beckon me from heaven''s open door,
And I can''t feel at home in this world anymore.','They''re all expecting me, and that''s one thing I know,
My Savior pardoned me and now I onward go;
I know He''ll take me thro'' tho'' I am weak and poor,
And I can''t feel at home in this world anymore.','I have a loving Savior up in glory-land,
I don''t expect to stop until I with Him stand,
He''s waiting now for me in heaven''s open door,
And I can''t feel at home in this world anymore.','Just up in glory-land we''ll live eternally,
The saints on every hand are shouting victory,
Their songs of sweetest praise drift back from heaven''s shore,
And I can''t feel at home in this world anymore.'], 'eKqKQc5QmZQ', 'This world is not my home, I''m just a passing through', 'This beloved gospel hymn of unknown authorship has been sung for generations. It expresses the pilgrim mindset of Christians who view earth as temporary and heaven as their true home, echoing Hebrews 11:13-16.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (55, 'How Firm a Foundation', 'Traditional', 'Faith', ARRAY['How firm a foundation, ye saints of the Lord,
Is laid for your faith in His excellent Word!
What more can He say than to you He hath said,
To you who for refuge to Jesus have fled?','Fear not, I am with thee, O be not dismayed,
For I am thy God and will still give thee aid;
I''ll strengthen and help thee, and cause thee to stand
Upheld by My righteous, omnipotent hand.','When through the deep waters I call thee to go,
The rivers of woe shall not thee overflow;
For I will be with thee, thy troubles to bless,
And sanctify to thee thy deepest distress.','When through fiery trials thy pathways shall lie,
My grace, all sufficient, shall be thy supply;
The flame shall not hurt thee; I only design
Thy dross to consume, and thy gold to refine.','The soul that on Jesus has leaned for repose,
I will not, I will not desert to its foes;
That soul, though all hell should endeavor to shake,
I''ll never, no never, no never forsake.'], 'SYKpBQZpRGU', 'How firm a foundation, ye saints of the Lord', 'This traditional hymn first appeared in John Rippon''s ''A Selection of Hymns'' (1787). Author unknown, it powerfully quotes God''s promises from Isaiah 41:10, 43:2, and other scriptures, assuring believers of divine faithfulness through all trials.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (56, 'Crown Him with Many Crowns', 'Matthew Bridges', 'Praise', ARRAY['Crown Him with many crowns,
The Lamb upon His throne.
Hark! How the heavenly anthem drowns
All music but its own.
Awake, my soul, and sing
Of Him who died for thee,
And hail Him as thy matchless King
Through all eternity.','Crown Him the Lord of love;
Behold His hands and side,
Those wounds, yet visible above,
In beauty glorified.
No angel in the sky
Can fully bear that sight,
But downward bends his burning eye
At mysteries so bright.','Crown Him the virgin''s Son,
The God incarnate born,
Whose arm those crimson trophies won
Which now His brow adorn;
Fruit of the mystic rose,
As of that rose the stem;
The root whence mercy ever flows,
The Babe of Bethlehem.','Crown Him the Lord of life,
Who triumphed o''er the grave,
And rose victorious in the strife
For those He came to save.
His glories now we sing,
Who died, and rose on high,
Who died eternal life to bring,
And lives that death may die.'], 'rvgX_WGsdrI', 'Crown Him with many crowns', 'Matthew Bridges was a 19th-century Anglican who later converted to Roman Catholicism. Written in 1851, this majestic hymn celebrates Christ''s kingship with imagery from Revelation 19:12. Godfrey Thring added additional verses in 1874.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (57, 'Love Divine, All Loves Excelling', 'Charles Wesley', 'Worship', ARRAY['Love divine, all loves excelling,
Joy of heaven, to earth come down;
Fix in us Thy humble dwelling;
All Thy faithful mercies crown!
Jesus, Thou art all compassion,
Pure, unbounded love Thou art;
Visit us with Thy salvation,
Enter every trembling heart.','Breathe, O breathe Thy loving Spirit
Into every troubled breast!
Let us all in Thee inherit;
Let us find that second rest.
Take away our bent to sinning;
Alpha and Omega be;
End of faith, as its beginning,
Set our hearts at liberty.','Come, Almighty to deliver,
Let us all Thy life receive;
Suddenly return and never,
Nevermore Thy temples leave.
Thee we would be always blessing,
Serve Thee as Thy hosts above,
Pray and praise Thee without ceasing,
Glory in Thy perfect love.','Finish, then, Thy new creation;
Pure and spotless let us be.
Let us see Thy great salvation
Perfectly restored in Thee;
Changed from glory into glory,
Till in heaven we take our place,
Till we cast our crowns before Thee,
Lost in wonder, love, and praise.'], 'z2ie7iCj5nI', 'Love divine, all loves excelling', 'Charles Wesley, the prolific 18th-century Methodist hymn writer, penned this masterpiece in 1747. It beautifully expresses God''s transforming love and the believer''s sanctification, set to John Zundel''s tune ''Beecher'' or other melodies.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (58, 'All Hail the Power of Jesus'' Name', 'Edward Perronet', 'Praise', ARRAY['All hail the power of Jesus'' name!
Let angels prostrate fall;
Bring forth the royal diadem,
And crown Him Lord of all.
Bring forth the royal diadem,
And crown Him Lord of all.','Ye chosen seed of Israel''s race,
Ye ransomed from the fall,
Hail Him who saves you by His grace,
And crown Him Lord of all.
Hail Him who saves you by His grace,
And crown Him Lord of all.','Let every kindred, every tribe
On this terrestrial ball,
To Him all majesty ascribe,
And crown Him Lord of all.
To Him all majesty ascribe,
And crown Him Lord of all.','O that with yonder sacred throng
We at His feet may fall!
We''ll join the everlasting song,
And crown Him Lord of all.
We''ll join the everlasting song,
And crown Him Lord of all.'], 'nV2vmuSNNpc', 'All hail the power of Jesus'' name!', 'Edward Perronet was an 18th-century English Methodist preacher. Written in 1779, this ''coronation hymn'' declares Christ''s universal sovereignty. Perronet broke with Wesley over church governance but left this enduring legacy celebrating Jesus as Lord.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (59, 'When I Survey the Wondrous Cross', 'Isaac Watts', 'Easter', ARRAY['When I survey the wondrous cross
On which the Prince of glory died,
My richest gain I count but loss,
And pour contempt on all my pride.','Forbid it, Lord, that I should boast,
Save in the death of Christ my God!
All the vain things that charm me most,
I sacrifice them to His blood.','See from His head, His hands, His feet,
Sorrow and love flow mingled down!
Did e''er such love and sorrow meet,
Or thorns compose so rich a crown?','Were the whole realm of nature mine,
That were a present far too small;
Love so amazing, so divine,
Demands my soul, my life, my all.'], '57JY8sX-vL4', 'When I survey the wondrous cross', 'Isaac Watts, the ''Father of English Hymnody,'' wrote this profound meditation on the cross in 1707. Based on Galatians 6:14, it''s considered one of the greatest hymns in the English language, moving from contemplation to complete surrender.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (60, 'O Come, O Come, Emmanuel', 'Ancient Latin', 'Christmas', ARRAY['O come, O come, Emmanuel,
And ransom captive Israel,
That mourns in lonely exile here
Until the Son of God appear.

Rejoice! Rejoice! Emmanuel
Shall come to thee, O Israel.','O come, Thou Rod of Jesse, free
Thine own from Satan''s tyranny;
From depths of hell Thy people save,
And give them victory o''er the grave.','O come, Thou Dayspring, come and cheer
Our spirits by Thine advent here;
Disperse the gloomy clouds of night,
And death''s dark shadows put to flight.','O come, Thou Key of David, come
And open wide our heavenly home;
Make safe the way that leads on high,
And close the path to misery.'], 'XscjCSH2Oog', 'O come, O come, Emmanuel', 'This ancient Latin hymn dates to the 12th century, based on the ''O Antiphons'' sung before Christmas. Translated by John Mason Neale in 1851, its haunting melody and messianic titles express longing for Christ''s advent.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (61, 'Joy to the World', 'Isaac Watts', 'Christmas', ARRAY['Joy to the world, the Lord is come!
Let earth receive her King;
Let every heart prepare Him room,
And heaven and nature sing,
And heaven and nature sing,
And heaven, and heaven, and nature sing.','Joy to the world, the Savior reigns!
Let men their songs employ;
While fields and floods, rocks, hills and plains
Repeat the sounding joy,
Repeat the sounding joy,
Repeat, repeat, the sounding joy.','No more let sins and sorrows grow,
Nor thorns infest the ground;
He comes to make His blessings flow
Far as the curse is found,
Far as the curse is found,
Far as, far as, the curse is found.','He rules the world with truth and grace,
And makes the nations prove
The glories of His righteousness,
And wonders of His love,
And wonders of His love,
And wonders, wonders, of His love.'], 'hHzb0ilsvgg', 'Joy to the world, the Lord is come!', 'Isaac Watts wrote this hymn in 1719 based on Psalm 98, celebrating Christ''s reign. Though sung at Christmas, it originally focused on Christ''s second coming. Lowell Mason adapted Handel''s music in 1839, creating the familiar joyful arrangement.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (62, 'Silent Night', 'Joseph Mohr', 'Christmas', ARRAY['Silent night, holy night,
All is calm, all is bright
Round yon virgin mother and Child.
Holy Infant, so tender and mild,
Sleep in heavenly peace,
Sleep in heavenly peace.','Silent night, holy night,
Shepherds quake at the sight;
Glories stream from heaven afar,
Heavenly hosts sing Alleluia!
Christ the Savior is born,
Christ the Savior is born!','Silent night, holy night,
Son of God, love''s pure light;
Radiant beams from Thy holy face
With the dawn of redeeming grace,
Jesus, Lord, at Thy birth,
Jesus, Lord, at Thy birth.','Silent night, holy night,
Wondrous star, lend thy light;
With the angels let us sing,
Alleluia to our King;
Christ the Savior is born,
Christ the Savior is born!'], 'h6b2pKtr0Yg', 'Silent night, holy night', 'Joseph Mohr, an Austrian priest, wrote this poem in 1816. Franz Xaver Gruber composed the music in 1818 when their church organ broke. Translated into over 140 languages, it''s the world''s most recorded Christmas carol, symbolizing peace.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (63, 'Hark! The Herald Angels Sing', 'Charles Wesley', 'Christmas', ARRAY['Hark! The herald angels sing,
''Glory to the newborn King;
Peace on earth, and mercy mild,
God and sinners reconciled!''
Joyful, all ye nations rise,
Join the triumph of the skies;
With th''angelic host proclaim,
''Christ is born in Bethlehem!''
 
Hark! The herald angels sing,
''Glory to the newborn King!''','Christ, by highest heav''n adored;
Christ the everlasting Lord;
Late in time, behold Him come,
Offspring of a virgin''s womb.
Veiled in flesh the Godhead see;
Hail th''incarnate Deity,
Pleased with us in flesh to dwell,
Jesus our Emmanuel.','Hail the heav''nly Prince of Peace!
Hail the Sun of Righteousness!
Light and life to all He brings,
Ris''n with healing in His wings.
Mild He lays His glory by,
Born that man no more may die,
Born to raise the sons of earth,
Born to give us second birth.'], '4NdDIu1Q40M', 'Hark! The herald angels sing', 'Charles Wesley wrote this hymn in 1739, originally beginning ''Hark, how all the welkin rings.'' George Whitefield altered it to the current form. Felix Mendelssohn''s 1840 tune elevated it to classic status, celebrating the incarnation with theological depth.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (64, 'O Holy Night', 'Placide Cappeau', 'Christmas', ARRAY['O holy night! The stars are brightly shining,
It is the night of our dear Savior''s birth.
Long lay the world in sin and error pining,
Till He appeared and the soul felt its worth.
A thrill of hope, the weary world rejoices,
For yonder breaks a new and glorious morn.
 
Fall on your knees! O hear the angel voices!
O night divine, O night when Christ was born;
O night divine, O night, O night Divine.','Led by the light of faith serenely beaming,
With glowing hearts by His cradle we stand.
So led by light of a star sweetly gleaming,
Here came the wise men from Orient land.
The King of kings lay thus in lowly manger;
In all our trials born to be our friend.','Truly He taught us to love one another;
His law is love and His gospel is peace.
Chains shall He break for the slave is our brother;
And in His name all oppression shall cease.
Sweet hymns of joy in grateful chorus raise we,
Let all within us praise His holy name.'], 'lkWf9lagiMQ', 'O holy night! The stars are brightly shining', 'Placide Cappeau, a French wine merchant and poet, wrote this poem in 1847. Composer Adolphe Adam set it to music. John Sullivan Dwight''s 1855 English translation made it an American favorite, though initially controversial in France.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (65, 'And Can It Be', 'Charles Wesley', 'Grace', ARRAY['And can it be that I should gain
An int''rest in the Savior''s blood?
Died He for me, who caused His pain?
For me, who Him to death pursued?
Amazing love! How can it be
That Thou, my God, shouldst die for me?
 
Amazing love! How can it be
That Thou, my God, shouldst die for me?','He left His Father''s throne above,
So free, so infinite His grace;
Emptied Himself of all but love,
And bled for Adam''s helpless race;
''Tis mercy all, immense and free;
For, O my God, it found out me.','Long my imprisoned spirit lay
Fast bound in sin and nature''s night;
Thine eye diffused a quickening ray,
I woke, the dungeon flamed with light;
My chains fell off, my heart was free;
I rose, went forth, and followed Thee.','No condemnation now I dread;
Jesus, and all in Him, is mine!
Alive in Him, my living Head,
And clothed in righteousness divine,
Bold I approach th''eternal throne,
And claim the crown, through Christ my own.'], 'OpMWAO_D7P8', 'And can it be that I should gain', 'Charles Wesley wrote this powerful hymn in 1738, shortly after his conversion. It captures his amazement at God''s grace and the dramatic liberation of salvation. The hymn''s energy and theological depth make it a Methodist and evangelical favorite.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (66, 'Immortal, Invisible, God Only Wise', 'Walter Chalmers Smith', 'Worship', ARRAY['Immortal, invisible, God only wise,
In light inaccessible hid from our eyes,
Most blessed, most glorious, the Ancient of Days,
Almighty, victorious, Thy great name we praise.','Unresting, unhasting, and silent as light,
Nor wanting, nor wasting, Thou rulest in might;
Thy justice like mountains high soaring above
Thy clouds which are fountains of goodness and love.','To all life Thou givest, to both great and small;
In all life Thou livest, the true life of all;
We blossom and flourish as leaves on the tree,
And wither and perish, but naught changeth Thee.','Great Father of Glory, pure Father of Light,
Thine angels adore Thee, all veiling their sight;
All laud we would render: O help us to see
''Tis only the splendor of light hideth Thee.'], 'NacT-XxQcp0', 'Immortal, invisible, God only wise', 'Walter Chalmers Smith was a 19th-century Scottish Free Church minister. Written in 1867, this hymn draws from 1 Timothy 1:17 and uses vivid imagery to express God''s transcendence, immutability, and glory beyond human comprehension.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (67, 'Softly and Tenderly', 'Will L. Thompson', 'Invitation', ARRAY['Softly and tenderly Jesus is calling,
Calling for you and for me;
See, on the portals He''s waiting and watching,
Watching for you and for me.
 
Come home, come home,
Ye who are weary, come home;
Earnestly, tenderly, Jesus is calling,
Calling, O sinner, come home!','Why should we tarry when Jesus is pleading,
Pleading for you and for me?
Why should we linger and heed not His mercies,
Mercies for you and for me?','Time is now fleeting, the moments are passing,
Passing from you and from me;
Shadows are gathering, deathbeds are coming,
Coming for you and for me.','O for the wonderful love He has promised,
Promised for you and for me!
Though we have sinned, He has mercy and pardon,
Pardon for you and for me.'], 'C_Z5kXjvR2E', 'Softly and tenderly Jesus is calling', 'Will L. Thompson was a 19th-century American composer known as the ''Bard of Ohio.'' Written in 1880, this tender invitation hymn was reportedly D.L. Moody''s favorite. Its gentle melody and repeated ''come home'' appeal have led countless souls to Christ.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (68, 'Standing on the Promises', 'R. Kelso Carter', 'Faith', ARRAY['Standing on the promises of Christ my King,
Through eternal ages let His praises ring,
Glory in the highest, I will shout and sing,
Standing on the promises of God.
 
Standing, standing,
Standing on the promises of God my Savior;
Standing, standing,
I''m standing on the promises of God.','Standing on the promises that cannot fail,
When the howling storms of doubt and fear assail,
By the living Word of God I shall prevail,
Standing on the promises of God.','Standing on the promises of Christ the Lord,
Bound to Him eternally by love''s strong cord,
Overcoming daily with the Spirit''s sword,
Standing on the promises of God.','Standing on the promises I cannot fall,
List''ning every moment to the Spirit''s call,
Resting in my Savior as my all in all,
Standing on the promises of God.'], 'yc6iH-HW-A', 'Standing on the promises of Christ my King', 'R. Kelso Carter was a 19th-century American Methodist minister, professor, and hymn writer. Written in 1886, this upbeat hymn declares confidence in God''s unchanging promises. Its marching rhythm reflects the victorious Christian life of faith.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (69, 'Pass Me Not, O Gentle Savior', 'Fanny Crosby', 'Prayer', ARRAY['Pass me not, O gentle Savior,
Hear my humble cry;
While on others Thou art calling,
Do not pass me by.
 
Savior, Savior,
Hear my humble cry;
While on others Thou art calling,
Do not pass me by.','Trusting only in Thy merit,
Would I seek Thy face;
Heal my wounded, broken spirit,
Save me by Thy grace.','Thou the Spring of all my comfort,
More than life to me,
Whom have I on earth beside Thee?
Whom in Heav''n but Thee?','Let me at Thy throne of mercy
Find a sweet relief,
Kneeling there in deep contrition;
Help my unbelief.'], 'DM02ZH9Lahg', 'Pass me not, O gentle Savior', 'Fanny Crosby wrote this hymn in 1868, inspired by a prayer meeting where a young man cried out, ''Lord, do not pass me by!'' Despite her blindness, Crosby penned over 8,000 hymns, and this plea for God''s mercy remains deeply moving.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (70, 'O God, Our Help in Ages Past', 'Isaac Watts', 'Trust', ARRAY['O God, our help in ages past,
Our hope for years to come,
Our shelter from the stormy blast,
And our eternal home!','Under the shadow of Thy throne
Still may we dwell secure;
Sufficient is Thine arm alone,
And our defense is sure.','Before the hills in order stood,
Or earth received her frame,
From everlasting, Thou art God,
To endless years the same.','A thousand ages, in Thy sight,
Are like an evening gone;
Short as the watch that ends the night,
Before the rising sun.','Time, like an ever rolling stream,
Bears all who breathe away;
They fly forgotten, as a dream
Dies at the opening day.','O God, our help in ages past,
Our hope for years to come;
Be Thou our guide while life shall last,
And our eternal home.'], 'N-hN740J6qA', 'O God, our help in ages past', 'Isaac Watts based this 1708 hymn on Psalm 90, Moses'' meditation on God''s eternity versus human frailty. Originally ''Our God,'' John Wesley changed it to ''O God.'' It''s sung at British Remembrance services and expresses timeless trust in God.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (71, 'Jesus Paid It All', 'Elvina M. Hall', 'Salvation', ARRAY['I hear the Savior say,
''Thy strength indeed is small;
Child of weakness, watch and pray,
Find in Me thine all in all.''
 
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain,
He washed it white as snow.','Lord, now indeed I find
Thy pow''r, and Thine alone,
Can change the leper''s spots
And melt the heart of stone.','For nothing good have I
Whereby Thy grace to claim;
I''ll wash my garments white
In the blood of Calv''ry''s Lamb.','And when before the throne
I stand in Him complete,
''Jesus died my soul to save,''
My lips shall still repeat.'], 'su1-1db2dpw', 'I hear the Savior say', 'Elvina M. Hall wrote this hymn in 1865 while sitting in church. Music director John T. Grape composed the tune. The simple yet profound lyrics emphasize complete dependence on Christ''s atoning sacrifice, declaring that salvation is His work alone.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (72, 'I Love to Tell the Story', 'Katherine Hankey', 'Testimony', ARRAY['I love to tell the story
Of unseen things above,
Of Jesus and His glory,
Of Jesus and His love.
I love to tell the story,
Because I know ''tis true;
It satisfies my longings
As nothing else can do.
 
I love to tell the story,
''Twill be my theme in glory,
To tell the old, old story
Of Jesus and His love.','I love to tell the story;
More wonderful it seems
Than all the golden fancies
Of all our golden dreams.
I love to tell the story,
It did so much for me;
And that is just the reason
I tell it now to thee.','I love to tell the story;
''Tis pleasant to repeat
What seems, each time I tell it,
More wonderfully sweet.
I love to tell the story,
For some have never heard
The message of salvation
From God''s own holy Word.','I love to tell the story,
For those who know it best
Seem hungering and thirsting
To hear it like the rest.
And when, in scenes of glory,
I sing the new, new song,
''Twill be the old, old story
That I have loved so long.'], '0AOwA_Hdg0c', 'I love to tell the story', 'Katherine Hankey, a 19th-century English evangelist and poet, wrote this hymn in 1866 during illness. Part of a longer poem titled ''The Story Wanted,'' it expresses joy in sharing the gospel, emphasizing that the story never grows old.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (73, 'Joyful, Joyful, We Adore Thee', 'Henry van Dyke', 'Joy', ARRAY['Joyful, joyful, we adore Thee,
God of glory, Lord of love;
Hearts unfold like flow''rs before Thee,
Op''ning to the sun above.
Melt the clouds of sin and sadness;
Drive the dark of doubt away;
Giver of immortal gladness,
Fill us with the light of day!','All Thy works with joy surround Thee,
Earth and heav''n reflect Thy rays,
Stars and angels sing around Thee,
Center of unbroken praise.
Field and forest, vale and mountain,
Flow''ry meadow, flashing sea,
Singing bird and flowing fountain
Call us to rejoice in Thee.','Thou art giving and forgiving,
Ever blessing, ever blest,
Wellspring of the joy of living,
Ocean depth of happy rest!
Thou our Father, Christ our Brother,
All who live in love are Thine;
Teach us how to love each other,
Lift us to the joy divine.','Mortals, join the happy chorus,
Which the morning stars began;
Father love is reigning o''er us,
Brother love binds man to man.
Ever singing, march we onward,
Victors in the midst of strife,
Joyful music leads us Sunward
In the triumph song of life.'], 'O16J7rWmqK0', 'Joyful, joyful, we adore Thee', 'Henry van Dyke was an American Presbyterian minister and author. He wrote this text in 1907 at Williams College to be sung to Beethoven''s ''Ode to Joy'' from his Ninth Symphony. Its exuberant praise celebrates God''s creation and love.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;
INSERT INTO public.hymns (id, title, author, category, verses, youtube_id, first_line, bio) VALUES (74, 'The Church''s One Foundation', 'Samuel Stone', 'Unity', ARRAY['The Church''s one foundation
Is Jesus Christ her Lord,
She is His new creation
By water and the Word.
From heaven He came and sought her
To be His holy bride;
With His own blood He bought her
And for her life He died.','Elect from every nation,
Yet one o''er all the earth;
Her charter of salvation,
One Lord, one faith, one birth;
One holy Name she blesses,
Partakes one holy food,
And to one hope she presses,
With every grace endued.','Though with a scornful wonder
Men see her sore oppressed,
By schisms rent asunder,
By heresies distressed:
Yet saints their watch are keeping,
Their cry goes up, ''How long?''
And soon the night of weeping
Shall be the morn of song!','Mid toil and tribulation,
And tumult of her war,
She waits the consummation
Of peace forevermore;
Till, with the vision glorious,
Her longing eyes are blest,
And the great Church victorious
Shall be the Church at rest.','Yet she on earth hath union
With God the Three in One,
And mystic sweet communion
With those whose rest is won.
O happy ones and holy!
Lord, give us grace that we
Like them, the meek and lowly,
On high may dwell with Thee.'], 'rq1r9mQEZPA', 'The Church''s one foundation', 'Samuel Stone was a 19th-century Anglican clergyman. Written in 1866 during church controversies in South Africa, this hymn affirms the church''s unity in Christ despite divisions. Based on the Apostles'' Creed, it remains a statement of ecclesiological faith.') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, author=EXCLUDED.author, category=EXCLUDED.category, verses=EXCLUDED.verses, youtube_id=EXCLUDED.youtube_id, first_line=EXCLUDED.first_line, bio=EXCLUDED.bio;

SELECT setval(pg_get_serial_sequence('public.hymns','id'), COALESCE((SELECT MAX(id) FROM public.hymns),1));
