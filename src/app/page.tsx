import { dbConnect } from '@/lib/mongodb';
import RecipeModel from '@/models/Recipe';
import RecipeCard from '@/components/RecipeCard';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 12;

function normalize<T>(v: T | T[] | undefined, d: T): T {
  if (!v) return d;
  return Array.isArray(v) ? v[0] : v;
}

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  await dbConnect();
  const q = normalize(searchParams.q, '').trim();
  const page = Math.max(1, parseInt(normalize(searchParams.page, '1')) || 1);
  const sortKey = normalize(searchParams.sort, 'new'); // new | time | title

  const where = q ? {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { ingredients: { $elemMatch: { $regex: q, $options: 'i' } } },
      { requirements: { $elemMatch: { $regex: q, $options: 'i' } } },
      { tags: { $elemMatch: { $regex: q, $options: 'i' } } }
    ]
  } : {};

  const sortMap: any = {
    new: { createdAt: -1 },
    time: { prepTimeMinutes: 1 },
    title: { title: 1 },
  };
  const total = await RecipeModel.countDocuments(where);
  const items = await RecipeModel.find(where).sort(sortMap[sortKey] || sortMap.new).skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE).lean();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <section className="relative w-full overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dkekdqp99/image/upload/v1759318239/background-pattern_bhlvje.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative container-narrow py-16 grid gap-4 max-w-3xl">
          <h1 className="text-5xl font-extrabold leading-tight">Jouw receptenboek</h1>
          <p className="text-slate-600">Voeg je favoriete recepten toe zodat je ze nooit meer kwijtraakt!</p>
          <form className="flex gap-2 flex-col md:flex-row" action="/" method="get">
            <input className="flex-1 input border border-slate-200 rounded-xl px-3 py-2" type="search" name="q" placeholder="Search recipes, ingredients or #tags…" defaultValue={q} />
            <input type="hidden" name="sort" value={sortKey} />
            <button className="btn justify-center" type="submit">Zoeken</button>
          </form>
          <div className="flex items-center gap-3 pt-2">
            <label className="text-sm text-slate-600">Sort:</label>
            <a className={`chip ${sortKey==='new'?'bg-yellow-50 border-yellow-200':''}`} href={`/?q=${encodeURIComponent(q)}&sort=new`}>Nieuwste</a>
            <a className={`chip ${sortKey==='time'?'bg-yellow-50 border-yellow-200':''}`} href={`/?q=${encodeURIComponent(q)}&sort=time`}>Tijd ↑</a>
            <a className={`chip ${sortKey==='title'?'bg-yellow-50 border-yellow-200':''}`} href={`/?q=${encodeURIComponent(q)}&sort=title`}>Titel A–Z</a>
          </div>
        </div>
      </section>

      <section className="container-narrow grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6" id="explore">
        {items.map((r: any) => (
          <RecipeCard key={String(r._id)} id={String(r._id)} title={r.title} imageUrl={r.imageUrl} prepTimeMinutes={r.prepTimeMinutes} tags={r.tags || []} />
        ))}
      </section>

      <div className="container-narrow flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">Toon {(page-1)*PAGE_SIZE + 1}–{Math.min(page*PAGE_SIZE, total)} van {total}</div>
        <div className="flex gap-2">
          <a className={`btn btn-secondary ${page<=1?'pointer-events-none opacity-50':''}`} href={`/?q=${encodeURIComponent(q)}&sort=${sortKey}&page=${page-1}`}>Vorige</a>
          <a className={`btn btn-secondary ${page>=pages?'pointer-events-none opacity-50':''}`} href={`/?q=${encodeURIComponent(q)}&sort=${sortKey}&page=${page+1}`}>Volgende</a>
        </div>
      </div>
    </div>
  );
}
