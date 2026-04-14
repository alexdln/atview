import { describe, expect, test } from "vitest";

import { type Blob } from "@src/core/defs/document";
import { AstMediaNode, type AstCodeBlockNode, type AstParagraphNode } from "@src/core/ast";
import { atviewHtmlToAst, realHtmlToAst } from "@src/core/ast";
import { parseAtviewHtmlToAst } from "../helpers";

describe("realHtmlToAst", () => {
    test("paragraphs and emphasis", async () => {
        const ast = await realHtmlToAst("<p>a <strong>b</strong> c</p>");
        expect(ast).toEqual([
            {
                type: "paragraph",
                children: [
                    { type: "text", value: "a " },
                    { type: "bold", children: [{ type: "text", value: "b" }] },
                    { type: "text", value: " c" },
                ],
            },
        ]);
    });

    test("headings blockquote code list link hr", async () => {
        const ast = await realHtmlToAst(
            '<h3>T</h3><blockquote>Q</blockquote><pre><code class="language-rs">let x = 1;</code></pre><ul><li>one</li><li>two</li></ul><p><a href="https://x.test">L</a></p><hr />',
        );
        expect(ast.map((b) => b.type)).toEqual([
            "heading",
            "blockquote",
            "code-block",
            "unordered-list",
            "paragraph",
            "horizontal-rule",
        ]);
        const code = ast[2];
        expect(code?.type).toBe("code-block");
        expect((code as AstCodeBlockNode).language).toBe("rs");
    });

    test("aligns with atview pseudo-html for equivalent structure", async () => {
        const pseudo =
            '<span data-tag="h3">Title</span><span data-tag="blockquote">Quote</span>Plain <span data-tag="b">bold</span> end';
        const root = document.createElement("div");
        root.innerHTML = pseudo;
        const fromPseudo = atviewHtmlToAst(root, new Map());
        const fromHtml = await realHtmlToAst(
            "<h3>Title</h3><blockquote>Quote</blockquote><p>Plain <strong>bold</strong> end</p>",
        );
        expect(fromHtml).toEqual(fromPseudo);
    });

    test("objectStore maps blob URL to file on img src", async () => {
        const store = new Map<string, File>();
        // pseudo fetch and object-url generation for the image
        const file = new File([], "a.png", { type: "image/png" });
        const url = "blob:object-url-for-file";
        const processImageBlob = async (src: string | Blob) => {
            if (typeof src === "string") {
                store.set(url, file);
                return url;
            }
            return src;
        };
        const ast = await realHtmlToAst('<div><img src="https://example.com/a.png" alt="x" /></div>', {
            processImageBlob,
        });

        const media = ast[0];
        expect(media?.type).toBe("media");
        expect((media as AstMediaNode).image).toBe(url);
        expect(store.get((media as AstMediaNode).image as string)).toBe(file);
    });

    test("matches parseAtviewHtmlToAst for stored pseudo snippet", async () => {
        const pseudo = parseAtviewHtmlToAst('<span data-tag="link" data-record=\'{"uri":"u"}\'>t</span>');
        const fromReal = await realHtmlToAst('<p><a href="u">t</a></p>');
        expect(fromReal).toEqual(pseudo);
    });

    test("exact AST for every block type realHtmlToAst emits", async () => {
        const html = [
            "<p>alpha <strong>bold</strong></p>",
            "<h1>Title</h1>",
            "<blockquote>quote <em>q</em></blockquote>",
            '<pre><code class="language-json">{}</code></pre>',
            "<ul><li>one</li><li>two<ul><li>nested</li></ul></li></ul>",
            '<ol start="4"><li>ord</li></ol>',
            '<img src="https://cdn.example/x.png" alt="pic" />',
            "<hr />",
            '<bsky-post data-uri="at://did/app/post/k" data-cid="bafy">Embed</bsky-post>',
        ].join("");

        const ast = await realHtmlToAst(html);

        expect(ast).toEqual([
            {
                type: "paragraph",
                children: [
                    { type: "text", value: "alpha " },
                    { type: "bold", children: [{ type: "text", value: "bold" }] },
                ],
            },
            {
                type: "heading",
                level: 2,
                children: [{ type: "text", value: "Title" }],
            },
            {
                type: "blockquote",
                children: [{ type: "text", value: "quote q" }],
            },
            {
                type: "code-block",
                text: "{}",
                language: "json",
            },
            {
                type: "unordered-list",
                items: [
                    { children: [{ type: "text", value: "one" }] },
                    {
                        children: [{ type: "text", value: "two" }],
                        sublist: {
                            type: "unordered-list",
                            items: [{ children: [{ type: "text", value: "nested" }] }],
                        },
                    },
                ],
            },
            {
                type: "ordered-list",
                start: 4,
                items: [{ children: [{ type: "text", value: "ord" }] }],
            },
            {
                type: "media",
                text: "pic",
                image: "https://cdn.example/x.png",
                alt: "pic",
            },
            { type: "horizontal-rule" },
            {
                type: "bsky-post",
                uri: "at://did/app/post/k",
                cid: "bafy",
                text: "Embed",
            },
        ]);
    });

    test("math element", async () => {
        const ast = await realHtmlToAst('<p>before</p><math display="block">x^2</math>');
        expect(ast.map((b) => b.type)).toEqual(["paragraph", "math"]);
        expect(ast[1]).toEqual({ type: "math", content: "x^2" });
    });

    test("figure figcaption sets caption text and display text", async () => {
        const ast = await realHtmlToAst(
            '<figure><img src="https://cdn.example/p.png" alt="img-alt" /><figcaption>  Cap line  </figcaption></figure>',
        );
        const media = ast[0] as AstMediaNode;
        expect(media.type).toBe("media");
        expect(media.caption).toBe("Cap line");
        expect(media.text).toBe("Cap line");
        expect(media.alt).toBe("img-alt");
        expect(media.image).toBe("https://cdn.example/p.png");
    });

    test("figure data-caption when no figcaption", async () => {
        const ast = await realHtmlToAst(
            '<figure data-caption="From data"><img src="https://cdn.example/d.png" alt="a" /></figure>',
        );
        const media = ast[0] as AstMediaNode;
        expect(media.caption).toBe("From data");
        expect(media.text).toBe("From data");
    });

    test("figure data-alt overrides img alt for media block", async () => {
        const ast = await realHtmlToAst(
            '<figure data-alt="override"><img src="https://cdn.example/e.png" alt="ignored" /></figure>',
        );
        const media = ast[0] as AstMediaNode;
        expect(media.alt).toBe("override");
        expect(media.text).toBe("ignored");
    });

    test("nested container divs: pretty-print whitespace becomes two paragraphs, not noisy newlines", async () => {
        const html = `
<div>
  <div>
    <div>Hello</div>
  </div>
  <div>
    <div>World</div>
  </div>
</div>`;
        const ast = await realHtmlToAst(html);
        expect(ast).toHaveLength(2);
        const first = ast[0] as AstParagraphNode;
        const second = ast[1] as AstParagraphNode;
        expect(first).toEqual({ type: "paragraph", children: [{ type: "text", value: "Hello" }] });
        expect(second).toEqual({ type: "paragraph", children: [{ type: "text", value: "World" }] });
    });

    test("nested detailed html: should not be merged into one paragraph", async () => {
        const html = `<p>Lorem Ipsum</p>
<h3>Sit Amet</h3>
<p><a href="https://lorem.ipsum">lorem.ipsum</a></p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<h3>Lorem</h3>
<p><a href="https://lorem.ipsum">lorem.ipsum</a></p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        `;
        const ast = await realHtmlToAst(html);
        expect(ast).toHaveLength(9);
        expect(ast).toEqual([
            { type: "paragraph", children: [{ type: "text", value: "Lorem Ipsum" }] },
            { type: "heading", level: 3, children: [{ type: "text", value: "Sit Amet" }] },
            {
                type: "paragraph",
                children: [
                    { type: "link", uri: "https://lorem.ipsum", children: [{ type: "text", value: "lorem.ipsum" }] },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    },
                ],
            },
            { type: "heading", level: 3, children: [{ type: "text", value: "Lorem" }] },
            {
                type: "paragraph",
                children: [
                    { type: "link", uri: "https://lorem.ipsum", children: [{ type: "text", value: "lorem.ipsum" }] },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    },
                ],
            },
        ]);
    });
});
