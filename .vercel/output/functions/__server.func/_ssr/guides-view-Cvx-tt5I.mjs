import { a as lessonThumb, i as guides, t as GUIDE_PUBLISHED } from "./guides-MJkbfjV0.mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as openSite } from "./chronicle-Cxl7MlBr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guides-view-Cvx-tt5I.js
var import_jsx_runtime = require_jsx_runtime();
function GuideCard({ guide, compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		className: "guide-card",
		to: "/guides/$slug",
		params: { slug: guide.slug },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: guide.cover,
			alt: ""
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "guide-copy",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "meta",
					children: guide.game
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: guide.h1 }),
				compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: guide.description })
			]
		})]
	});
}
function GuideIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "guide",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "kicker",
				children: "Ghostpot"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Гайды по мирам Люси" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lead",
				children: "Пройденные заезды и короткие уроки с канала. Электроника пустоши, Кентукки без сейва, колония, Азерот. Картинка — тема, ссылка ведёт на шорт."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "guide-list",
				children: guides.map((guide) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideCard, { guide }, guide.slug))
			})
		]
	});
}
function GuideArticle({ guide }) {
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
		author: {
			"@type": "Person",
			name: "Николай Чичкань",
			url: "https://ghostpot.ru/#about"
		},
		publisher: {
			"@type": "Organization",
			name: "Ghostpot",
			url: "https://ghostpot.ru/"
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "guide",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "kicker",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/guides",
						children: "Гайды"
					}),
					" · ",
					guide.game
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: guide.h1 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figure", {
				className: "guide-hero",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: guide.cover,
					alt: ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lead",
				children: guide.lead
			}),
			guide.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: section.heading }), section.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, paragraph.slice(0, 48)))] }, section.heading)),
			guide.lessons.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Уроки и шорты" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lesson-grid",
				children: guide.lessons.map((lesson) => {
					const thumb = lessonThumb(lesson.href);
					const short = lesson.href.includes("/shorts/");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "lesson-card",
						href: lesson.href,
						target: "_blank",
						rel: "noreferrer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "lesson-shot",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: thumb || guide.cover,
									alt: ""
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: short ? "Шорт" : "Запись" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: lesson.title }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: lesson.text })
						]
					}, lesson.href);
				})
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Отдельного плейлиста этого заезда на канале пока нет. Заметки выше с самого прохождения." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Мир на сайте:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: `/#world=${encodeURIComponent(guide.world)}`,
					onClick: (event) => {
						if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
						event.preventDefault();
						openSite(`world=${guide.world}`);
					},
					children: guide.world
				}),
				" · ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/#home",
					onClick: (event) => {
						if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
						event.preventDefault();
						openSite("home");
					},
					children: "Главная Ghostpot"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ещё гайды" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "guide-list",
				children: more.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideCard, {
					guide: item,
					compact: true
				}, item.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(schema) }
			})
		]
	});
}
//#endregion
export { GuideIndex as n, GuideArticle as t };
