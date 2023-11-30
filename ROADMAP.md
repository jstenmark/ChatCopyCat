
# Wishlist
- clipboard token count
- anonymization of inquirys to aid privacy concerns
- further token window opimizations
- improved clipboard management/context store
- take more inspiration from latest cursor blogpost, codeium got some good stuff too


# Context strategy?

1. **Abstract Syntax Tree (AST) Analysis**:
   - Extracting ASTs can give an AI context about the structure of the code, which can be used to infer types, dependencies, variable scopes, and other important details.
   - You could implement a feature that allows users to upload an AST along with their code snippet. A tool like TypeScript's compiler API can generate ASTs for TypeScript code.

2. **Language Server Index Format (LSIF)**:
   - LSIF provides rich code intelligence, including hover information, definitions, and references.
   - Incorporating LSIF data can help the AI understand the relations and connections between various parts of the code, giving it a more profound understanding of the snippet's context.

3. **Inline Dependency Resolution**:
   - Users can be encouraged to provide additional context for their code snippets manually. This can include relevant interfaces, classes, or helper functions that are used within the code snippet.
   - A tool or script could be developed to extract and include this context automatically based on the call stack or symbol usage.

4. **Code Comment Metadata**:
   - Introducing a convention for comments that users can include in their code snippets can provide hints to the AI. For example, a comment that indicates the purpose of a function or what a variable represents.

5. **Symbol Resolution through a Language Server Protocol (LSP)**:
   - Utilize LSP to resolve symbols and provide definitions, type information, and references that can help the AI understand the code's functionality beyond the snippet.
