function History({onOpen, empty = false}) {
  const {SpreadCard, EmptyState, Button} = window.DesignSystem_8c38cb;
  const items = window.ARKAN_HISTORY;
  if (empty) return (
    <Scroll style={{justifyContent:"center"}}>
      <EmptyState title="Здесь появятся ваши расклады"
        description="Каждый разговор сохраняется — к нему можно вернуться через неделю или через год."
        action={<Button variant="secondary">Задать вопрос</Button>} />
    </Scroll>
  );
  return (
    <Scroll style={{gap:"var(--space-6)"}}>
      <h1 className="t-title" style={{margin:0}}>История</h1>
      <div style={{display:"flex", flexDirection:"column", gap:"var(--space-4)"}}>
        {items.map(it => <SpreadCard key={it.date} {...it} onOpen={onOpen} />)}
      </div>
      <p className="t-caption" style={{margin:"var(--space-4) 0 0", color:"var(--text-tertiary)", textAlign:"center"}}>Расклады старше года удаляются автоматически</p>
    </Scroll>
  );
}
Object.assign(window, {History});
