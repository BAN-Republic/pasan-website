// TODO(Step 7): drive --p and the label from scroll position (needs a client component).
export default function ScrollTimecode() {
  return (
    <div className="tcbar" aria-hidden="true">
      <div className="fill" id="tcfill"></div>
      <span className="lbl mono" id="tclbl">
        TC 00:00:00:00
      </span>
    </div>
  );
}
