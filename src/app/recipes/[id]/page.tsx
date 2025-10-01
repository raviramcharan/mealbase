import { dbConnect } from '@/lib/mongodb';
import RecipeModel from '@/models/Recipe';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import Link from 'next/link';

type Props = { params: { id: string } };

export default async function RecipePage({ params }: Props) {
  await dbConnect();
  const r = await RecipeModel.findById(params.id).lean();
  if (!r) return <div>Not found</div>;
  const session = await getServerSession(authOptions as any);
  const canEdit = session && String((session.user as any)?.id) === String(r.ownerId);
  return (
    <article className="container-narrow">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <h1>{r.title} <span className="badge">⏱ {r.prepTimeMinutes} min</span></h1>
        {canEdit ? <div className="flex gap-2"><Link className="btn btn-secondary" href={`/recipes/${String(r._id)}/edit`}>Edit</Link><form action={`/recipes/${String(r._id)}/delete`} method="post"><button className="btn">Delete</button></form></div> : null}
      </div>
      {r.tags?.length ? <div className="chips">{r.tags.map((t:string,i:number)=>(<span key={i} className="badge">#{t}</span>))}</div> : null}
      {r.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.imageUrl} alt={r.title} style={{width:'100%', maxHeight:420, objectFit:'cover', borderRadius:16, border:'1px solid var(--border)', marginTop:12}} />
      )}
      <section style={{marginTop:16}}>
        <h3>Requirements</h3>
        <ul>{r.requirements?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
      </section>
      <section style={{marginTop:16}}>
        <h3>Ingredients</h3>
        <ul>{r.ingredients?.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
      </section>
      <section style={{marginTop:16}}>
        <h3>Nutrition</h3>
        <p>{r.nutrition.calories} kcal • {r.nutrition.protein}g protein • {r.nutrition.carbs}g carbs • {r.nutrition.fats}g fats</p>
      </section>
      <section style={{marginTop:16}}>
        <h3>Instructions</h3>
        <pre style={{whiteSpace:'pre-wrap', fontFamily:'inherit', lineHeight:1.6}}>{r.instructions}</pre>
      </section>
    </article>
  );
}
