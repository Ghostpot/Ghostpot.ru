import { shardByWorld, shards, type Shard } from "@/data/shards";

export function ShardMark({ id, size = 42 }: { id: string; size?: number }) {
  return <img className="shard-mark" src={`/brand/shards/${id}.webp`} width={size} height={size} alt="" />;
}

export function ShardPin({ world }: { world: string }) {
  const shard = shardByWorld(world);
  if (!shard) return null;
  return (
    <span className="shard-pin" data-led="pin" title={shard.artifact}>
      <ShardMark id={shard.id} size={28} />
    </span>
  );
}

function Plate({ shard }: { shard: Shard }) {
  return (
    <article className="shard-plate">
      <ShardMark id={shard.id} size={64} />
      <div>
        <p className="meta">Осколок памяти · {shard.world}</p>
        <b>{shard.artifact}</b>
        <p>{shard.line}</p>
      </div>
    </article>
  );
}

export function ShardPlate({ world }: { world: string }) {
  const shard = shardByWorld(world);
  if (!shard) return null;
  return <Plate shard={shard} />;
}

export function ShardVault({ onOpen }: { onOpen: (world: string) => void }) {
  return (
    <section className="section between">
      <header>
        <div>
          <p className="kicker">Межселенная</p>
          <h2>Осколки памяти</h2>
          <p className="sub">Из каждого Мира она унесла одну вещь.</p>
        </div>
      </header>
      <div className="shard-grid" data-led="shards">
        {shards.map((shard) => (
          <button key={shard.id} className="shard" type="button" onClick={() => onOpen(shard.world)}>
            <ShardMark id={shard.id} />
            <span>
              <b>{shard.artifact}</b>
              <em>{shard.world}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
