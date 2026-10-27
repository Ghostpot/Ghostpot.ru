import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { guideBySlug } from "@/data/guides";
import { GuideArticle } from "@/components/guides-view";
import { Shell } from "@/components/chronicle";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = guideBySlug(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Ghostpot` : "Гайд — Ghostpot" },
      { name: "description", content: loaderData?.description ?? "" },
    ],
    links: loaderData ? [{ rel: "canonical", href: `https://ghostpot.ru/guides/${loaderData.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <Shell view={{ name: "law" }} guides>
      <article className="guide">
        <h1>Такого гайда нет</h1>
        <p>
          <Link to="/guides">Все гайды</Link>
        </p>
      </article>
    </Shell>
  ),
  component: function GuidePage() {
    const guide = Route.useLoaderData();
    return (
      <Shell view={{ name: "law" }} guides>
        <GuideArticle guide={guide} />
      </Shell>
    );
  },
});