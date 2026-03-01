CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  cnpj TEXT,
  score INTEGER,
  status TEXT,
  sales_kit JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_leads" ON leads USING (auth.uid() = user_id);
