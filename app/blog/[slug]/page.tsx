import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

export const revalidate = 60; // Revalidate every 60 seconds

// Generate Static Params
export async function generateStaticParams() {
  const query = `*[_type=='post']{
    "slug": slug.current
  }`;

  const slugs = await client.fetch(query);

  // Return array of params objects
  return slugs.map((item: { slug: string }) => ({
    slug: item.slug,
  }));
}

// Dynamic Page Component
export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params to resolve
  const { slug } = await params;

  const query = `
    *[_type=='post' && slug.current == $slug]{
      title,
      summary,
      image,
      content,
      author->{
        bio,
        image,
        name
      }
    }[0]
  `;

  const post = await client.fetch(query, { slug });

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </div>
    );
  }

  return (
    <article className="mt-12 mb-24 px-2 2xl:px-12 flex flex-col gap-y-8">
      {/* Blog Title */}
      <h1 className="text-xl xs:text-3xl lg:text-5xl font-bold text-dark dark:text-light">
        {post.title}
      </h1>

      {/* Featured Image */}
      <Image
        src={urlForImage(post.image)}
        width={500}
        height={500}
        alt={post.title}
        className="rounded"
      />

      {/* Blog Summary */}
      <section>
        <h2 className="text-xl xs:text-2xl md:text-3xl font-bold uppercase text-accentDarkPrimary">
          Summary
        </h2>
        <p className="text-base md:text-xl leading-relaxed text-justify text-dark/80 dark:text-light/80">
          {post.summary}
        </p>
      </section>

      {/* Author Section */}
      <section className="px-2 sm:px-8 md:px-12 flex gap-2 xs:gap-4 sm:gap-6 items-start xs:items-center justify-start">
        <Image
          src={urlForImage(post.author.image)}
          width={200}
          height={200}
          alt={post.author.name}
          className="object-cover rounded-full h-12 w-12 sm:h-24 sm:w-24"
        />
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-dark dark:text-light">
            {post.author.name}
          </h3>
          <p className="italic text-xs xs:text-sm sm:text-base text-dark/80 dark:text-light/80">
            {post.author.bio}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="text-lg leading-normal text-dark/80 dark:text-light/80 prose">
        <PortableText value={post.content} />
      </section>
    </article>
  );
}
