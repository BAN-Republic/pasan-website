interface ClientsProps {
  clients: string[];
}

export default function Clients({ clients }: ClientsProps) {
  if (clients.length === 0) return null;
  return (
    <section className="sec" id="clients">
      <div className="wrap">
        <p className="k mono gold" style={{ marginBottom: 28 }}>
          Trusted by
        </p>
        <div className="clients">
          {clients.map((client) => (
            <span key={client}>{client}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
