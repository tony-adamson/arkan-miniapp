function App() {
  const [theme, setTheme] = React.useState("dark");
  const [screen, setScreen] = React.useState("onboarding");
  const [tab, setTab] = React.useState("ask");
  const [question, setQuestion] = React.useState("");

  const go = (s) => setScreen(s);
  const onTab = (t) => { setTab(t); setScreen(t); };

  const titles = {ask:"Новый расклад", reading:"Расклад", summary:"Итог", history:"История", day:"Карта дня", profile:"Профиль"};
  const showChrome = screen !== "onboarding";

  return (
    <Phone theme={theme}>
      {showChrome && <TgHeader title={titles[screen]}
        onBack={screen === "reading" || screen === "summary" ? () => go("ask") : undefined}
        right={<Icon name="ellipsis" size={18} />} />}
      {screen === "onboarding" && <Onboarding onDone={() => { go("ask"); setTab("ask"); }} />}
      {screen === "ask" && <AskQuestion onSubmit={q => { setQuestion(q); go("reading"); }} />}
      {screen === "reading" && <Reading question={question} onFinish={() => go("summary")} />}
      {screen === "summary" && <Summary question={question} onHistory={() => { setTab("history"); go("history"); }} />}
      {screen === "history" && <History onOpen={() => go("summary")} />}
      {screen === "day" && <CardOfDay />}
      {screen === "profile" && <Profile theme={theme} onTheme={setTheme} />}
      {showChrome && screen !== "reading" && screen !== "summary" && <TabBar active={tab} onChange={onTab} />}
    </Phone>
  );
}
Object.assign(window, {App});
