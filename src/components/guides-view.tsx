import { Link } from "@tanstack/react-router";
import { guides, GUIDE_PUBLISHED, lessonThumb, type Guide } from "@/data/guides";
import { openSite } from "@/components/chronicle";

export function GuideCard({ guide, compact = false }: { guide: Guide; compact?: boolean }) {
  return (
    <Link className="guide-card" to="/guides/$slug" params={{ slug: guide.slug }}>
      <img src={guide.cover} alt="" />
      <span className="guide-copy">
        <span className="meta">{guide.game}</span>
        <b>{guide.h1}</b>
        {compact ? null : <span>{guide.description}</span>}
      </span>
    </Link>
  );
}

export function GuideIndex() {
  return (
    <article className="guide">
      <p className="kicker">Ghostpot</p>
      <h1>Гайды по мирам Люси</h1>
      <p className="lead">
        Пройденные заезды и короткие уроки с канала. Электроника пустоши, Кентукки без сейва, колония, Азерот. Картинка — тема, ссылка ведёт на шорт.
      </p>
      <div className="guide-list">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </article>
  );
}

export function GuideArticle({ guide }: { guide: Guide }) {
  const url = `https://ghostpot.ru/guides/${guide.slug}`;
  const related = guides.filter((item) => item.slug !== guide.slug && (item.world === guide.world || item.game === guide.game)).slice(0, 3);
  const more = related.length ? related : guides.filter((item) => item.slug !== guide.slug).slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    image: `https://ghostpot.ru${guide.cover}`,
    datePublished: GUIDE_PUBLISHED,
    dateModified: GUIDE_PUBLISHED,
    inLanguage: "ru",
    mainEntityOfPage: url,
    author: { "@type": "Person", name: "Николай Чичкань", url: "https://ghostpot.ru/#about" },
    publisher: { "@type": "Organization", name: "Ghostpot", url: "https://ghostpot.ru/" },
  };
  return (
    <article className="guide">
      <p className="kicker">
        <Link to="/guides">Гайды</Link>
        {" · "}
        {guide.game}
      </p>
      <h1>{guide.h1}</h1>
      <figure className="guide-hero">
        <img src={guide.cover} alt="" />
      </figure>
      <p className="lead">{guide.lead}</p>
      {guide.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>
      ))}
      {guide.lessons.length ? (
        <section>
          <h2>Уроки и шорты</h2>
          <div className="lesson-grid">
            {guide.lessons.map((lesson) => {
              const thumb = lessonThumb(lesson.href);
              const short = lesson.href.includes("/shorts/");
              return (
                <a key={lesson.href} className="lesson-card" href={lesson.href} target="_blank" rel="noreferrer">
                  <span className="lesson-shot">
                    <img src={thumb || guide.cover} alt="" />
                    <i>{short ? "Шорт" : "Запись"}</i>
                  </span>
                  <b>{lesson.title}</b>
                  <em>{lesson.text}</em>
                </a>
              );
            })}
          </div>
        </section>
      ) : (
        <p>Отдельного плейлиста этого заезда на канале пока нет. Заметки выше с самого прохождения.</p>
      )}
      <p>
        Мир на сайте:{" "}
        <a
          href={`/#world=${encodeURIComponent(guide.world)}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            openSite(`world=${guide.world}`);
          }}
        >
          {guide.world}
        </a>
        {" · "}
        <a
          href="/#home"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            openSite("home");
          }}
        >
          Главная Ghostpot
        </a>
      </p>
      <h2>Ещё гайды</h2>
      <div className="guide-list">
        {more.map((item) => (
          <GuideCard key={item.slug} guide={item} compact />
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </article>
  );
}