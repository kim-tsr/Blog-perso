import CodeBlock from './CodeBlock'

export const mdxComponents = {
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <CodeBlock>{props.children}</CodeBlock>,
}
