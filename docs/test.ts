watchFiles() {
  const watcher = workspace.createFileSystemWatcher('**/*.md')

  watcher.onDidCreate(() => {
    this.refreshAll()
  })

  watcher.onDidDelete(() => {
    this.refreshAll()
  })

  watcher.onDidChange(() => {
    this.refreshAll()
  })

  this.subscribe(watcher)
}
