import type { Metadata } from "next";
import Link from "next/link";
import { texasPoliticsStory as story } from "../texas-politics-story";

export const metadata: Metadata = {
  title: story.title,
  description: story.description,
  alternates: { canonical: `https://www.gsrlonestarreport.com${story.path}` },
};

export default function TexasPoliticsStoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/" className="underline">Lone Star Report home</Link>
      <article className="gsr-card mt-6 p-6 sm:p-8">
        <p className="texas-section-label">Analysis</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{story.title}</h1>
        <p className="mt-4 font-semibold">By {story.byline}</p>
        <p className="italic">Lone Star Report</p>
        <time dateTime={story.date} className="mt-1 block text-sm">Nov. 12, 2026</time>
        <div className="mt-6 space-y-4 leading-7">
          {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className="mt-6 text-sm">
          Election coverage from <a className="underline" href="https://apnews.com/article/c9a0ffa1ec3cd599f9bc304ae26268a2">The Associated Press</a>
          {" and "}<a className="underline" href="https://www.texastribune.org/2026/11/03/texas-dan-patrick-vikki-goodwin-lt-governor-election-2026/">The Texas Tribune</a>.
        </p>
      </article>
    </main>
  );
}
