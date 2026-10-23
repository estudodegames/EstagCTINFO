import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Endpoints - CRUD de Estágios de Jogos Digitais

// 1. LER (Read All com filtros de busca opcionais)
app.get('/api/estagios', (req: Request, res: Response) => {
  try {
    let records = storage.getAll();
    const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';

    if (query) {
      records = records.filter(r =>
        r.matricula.toLowerCase().includes(query) ||
        r.nome.toLowerCase().includes(query) ||
        r.localEstagio.toLowerCase().includes(query) ||
        (r.area && r.area.toLowerCase().includes(query)) ||
        (r.supervisor && r.supervisor.toLowerCase().includes(query))
      );
    }

    if (statusFilter && statusFilter !== 'Todos') {
      records = records.filter(r => r.status === statusFilter);
    }

    res.json(records);
  } catch (err: any) {
    console.error('Erro ao listar estágios:', err);
    res.status(500).json({ error: 'Erro ao buscar cadastros de estágios.' });
  }
});

// 2. LER UM (Read by ID)
app.get('/api/estagios/:id', (req: Request, res: Response) => {
  try {
    const record = storage.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Registro de estágio não encontrado.' });
    }
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao consultar estágio.' });
  }
});

// 3. CRIAR (Create)
app.post('/api/estagios', (req: Request, res: Response) => {
  try {
    const {
      matricula,
      nome,
      localEstagio,
      area,
      status,
      dataInicio,
      cargaHoraria,
      supervisor,
      observacoes
    } = req.body;

    if (!matricula || !matricula.toString().trim()) {
      return res.status(400).json({ error: 'O campo Matrícula é obrigatório.' });
    }
    if (!nome || !nome.toString().trim()) {
      return res.status(400).json({ error: 'O campo Nome do Aluno é obrigatório.' });
    }
    if (!localEstagio || !localEstagio.toString().trim()) {
      return res.status(400).json({ error: 'O campo Local de Estágio é obrigatório.' });
    }

    const created = storage.create({
      matricula: String(matricula).trim(),
      nome: String(nome).trim(),
      localEstagio: String(localEstagio).trim(),
      area: area ? String(area).trim() : 'Desenvolvimento de Jogos Digitais',
      status: status || 'Ativo',
      dataInicio: dataInicio ? String(dataInicio).trim() : undefined,
      cargaHoraria: cargaHoraria ? String(cargaHoraria).trim() : '30h',
      supervisor: supervisor ? String(supervisor).trim() : undefined,
      observacoes: observacoes ? String(observacoes).trim() : undefined,
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error('Erro ao criar estágio:', err.message);
    res.status(400).json({ error: err.message || 'Erro ao cadastrar estágio.' });
  }
});

// 4. ATUALIZAR (Update)
app.put('/api/estagios/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      matricula,
      nome,
      localEstagio,
      area,
      status,
      dataInicio,
      cargaHoraria,
      supervisor,
      observacoes
    } = req.body;

    if (matricula !== undefined && !matricula.toString().trim()) {
      return res.status(400).json({ error: 'A matrícula não pode ficar em branco.' });
    }
    if (nome !== undefined && !nome.toString().trim()) {
      return res.status(400).json({ error: 'O nome do aluno não pode ficar em branco.' });
    }
    if (localEstagio !== undefined && !localEstagio.toString().trim()) {
      return res.status(400).json({ error: 'O local de estágio não pode ficar em branco.' });
    }

    const updated = storage.update(id, {
      ...(matricula && { matricula: String(matricula).trim() }),
      ...(nome && { nome: String(nome).trim() }),
      ...(localEstagio && { localEstagio: String(localEstagio).trim() }),
      ...(area !== undefined && { area: String(area).trim() }),
      ...(status && { status }),
      ...(dataInicio !== undefined && { dataInicio: String(dataInicio).trim() }),
      ...(cargaHoraria !== undefined && { cargaHoraria: String(cargaHoraria).trim() }),
      ...(supervisor !== undefined && { supervisor: String(supervisor).trim() }),
      ...(observacoes !== undefined && { observacoes: String(observacoes).trim() }),
    });

    res.json(updated);
  } catch (err: any) {
    console.error('Erro ao atualizar estágio:', err.message);
    res.status(400).json({ error: err.message || 'Erro ao atualizar cadastro.' });
  }
});

// 5. EXCLUIR (Delete)
app.delete('/api/estagios/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = storage.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Registro não encontrado para exclusão.' });
    }
    res.json({ success: true, message: 'Cadastro de estágio excluído com sucesso.' });
  } catch (err: any) {
    console.error('Erro ao excluir estágio:', err);
    res.status(500).json({ error: 'Erro ao excluir cadastro de estágio.' });
  }
});

// Reset para dados de demonstração (útil para testes rápidos)
app.post('/api/estagios/reset-sample', (_req: Request, res: Response) => {
  try {
    const records = storage.resetSampleData();
    res.json({ message: 'Dados restaurados com sucesso.', records });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao restaurar dados de demonstração.' });
  }
});

async function startServer() {
  if (!isProduction) {
    // Modo Desenvolvimento: Conecta Vite Dev Server via middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo Produção: Serve arquivos estáticos gerados em dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor Estágios Jogos Digitais] Rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha crítica ao iniciar o servidor:', err);
  process.exit(1);
});
