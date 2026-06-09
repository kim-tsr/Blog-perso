import CodeBlock from './CodeBlock'
import Mermaid from './diagrams/Mermaid'
import Stack from './diagrams/Stack'
import Topology from './diagrams/Topology'
import Pipeline from './diagrams/Pipeline'

export const mdxComponents = {
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <CodeBlock>{props.children}</CodeBlock>,

  // Diagrammes — utilisables directement dans le MDX des labs
  Mermaid,
  Stack,
  Topology,
  Pipeline,
}
