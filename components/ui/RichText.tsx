import type { ReactNode } from 'react';
import Image from 'next/image';
import { mediaUrl } from '@/lib/media';
import type { RichBlock, RichInline, RichText as RichTextNode } from '@/lib/types';
import SmartLink from './SmartLink';

function text(node: RichTextNode, key: number): ReactNode {
  let out: ReactNode = node.text;
  if (node.code) out = <code>{out}</code>;
  if (node.bold) out = <strong>{out}</strong>;
  if (node.italic) out = <em>{out}</em>;
  if (node.underline) out = <u>{out}</u>;
  if (node.strikethrough) out = <s>{out}</s>;
  return <span key={key}>{out}</span>;
}

function inline(children: RichInline[]) {
  return children.map((child, i) =>
    child.type === 'link' ? (
      <SmartLink key={i} href={child.url}>
        {child.children.map(text)}
      </SmartLink>
    ) : (
      text(child, i)
    ),
  );
}

/** Renders Strapi "blocks" rich text. Article headings start at H2 (the title is the H1). */
export default function RichText({ blocks }: { blocks?: RichBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <div className="prose">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{inline(block.children)}</p>;
          case 'heading': {
            const Tag = `h${Math.min(6, Math.max(2, block.level))}` as 'h2';
            return <Tag key={i}>{inline(block.children)}</Tag>;
          }
          case 'quote':
            return <blockquote key={i}>{inline(block.children)}</blockquote>;
          case 'code':
            return (
              <pre key={i}>
                <code>{block.children.map((c) => c.text).join('')}</code>
              </pre>
            );
          case 'list': {
            const Tag = block.format === 'ordered' ? 'ol' : 'ul';
            return (
              <Tag key={i}>
                {block.children.map((item, j) => (
                  <li key={j}>{inline(item.children)}</li>
                ))}
              </Tag>
            );
          }
          case 'image': {
            const src = mediaUrl(block.image);
            if (!src) return null;
            return (
              <figure key={i} className="prose__image">
                <Image
                  src={src}
                  alt={block.image.alternativeText || ''}
                  fill
                  sizes="(max-width: 767px) 100vw, 720px"
                />
              </figure>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
