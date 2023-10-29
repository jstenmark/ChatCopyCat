/**
 * Generates a template string that lists the root path and files for each project in the input array.
 *
 * @param projectsFiles - An array of objects representing projects. Each object has a `rootPath` property (string) and a `files` property (array of strings) that contains the files for that project.
 * @returns A string that represents the template with the root path and files for each project.
 */
export function generateFilesTemplate(projectsFiles: { rootPath: string; files: string[] }[]): string {
  let output = ''

  for (const project of projectsFiles) {
    output += `**Workspace root:** ${project.rootPath}\n`
    for (const file of project.files) {
      output += file + '\n'
    }
    output += '\n'
  }

  return output.trim()
}
