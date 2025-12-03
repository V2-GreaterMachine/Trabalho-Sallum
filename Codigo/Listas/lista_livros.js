
    const KEY = 'minha_lista_de_livros_v1';
    const listaEl = document.getElementById('lista');
    const form = document.getElementById('form');
    const titleInput = document.getElementById('title');
    const statusSelect = document.getElementById('status');
    const empty = document.getElementById('empty');
    const total = document.getElementById('total');
    const counts = document.getElementById('counts');

    let livros = JSON.parse(localStorage.getItem(KEY) || '[]');
    let filtro = 'todos';

    function salvar(){ localStorage.setItem(KEY, JSON.stringify(livros)); }

    function atualizarEstatisticas(){
      total.textContent = livros.length + (livros.length === 1 ? ' livro' : ' livros');
      const lidos = livros.filter(f=>f.status==='lido').length;
      const desejo = livros.length - lidos;
      counts.textContent = lidos + ' lidos • ' + desejo + ' desejo';
    }

    function criarItemEl(f){
      const li = document.createElement('li');li.className='filme';
      const info = document.createElement('div');info.className='info';
      const badge = document.createElement('div');badge.className='badge';
      const texts = document.createElement('div');
      const t = document.createElement('div');t.className='title';t.textContent = f.title;
      const m = document.createElement('div');m.className='meta';m.textContent = f.status === 'lido' ? 'Lido' : 'Desejo ler';
      if(f.status === 'lido') badge.style.background = 'var(--brown)';
      texts.appendChild(t);texts.appendChild(m);
      info.appendChild(badge);info.appendChild(texts);

      const actions = document.createElement('div');actions.className='actions';
      const toggle = document.createElement('button');toggle.className='btn toggle';toggle.textContent = f.status === 'lido' ? 'Marcar como desejo' : 'Marcar como lido';
      toggle.onclick = ()=>{f.status = f.status==='lido' ? 'desejo' : 'lido'; render(); salvar();};

      const edit = document.createElement('button');edit.className='btn edit';edit.textContent='Editar';
      edit.onclick = ()=>{const novo = prompt('Editar título:', f.title); if(novo!==null && novo.trim()){f.title = novo.trim(); salvar(); render();}};

      const del = document.createElement('button');del.className='btn delete';del.textContent='Remover';
      del.onclick = ()=>{if(confirm('Remover "'+f.title+'" da lista?')){livros = livros.filter(x=>x.id!==f.id); salvar(); render();}};

      actions.appendChild(toggle);actions.appendChild(edit);actions.appendChild(del);

      li.appendChild(info);li.appendChild(actions);
      return li;
    }

    function render(){
      listaEl.innerHTML='';
      const visiveis = livros.filter(f=> filtro==='todos' ? true : (f.status===filtro));
      if(visiveis.length===0){ empty.style.display='block'; } else { empty.style.display='none'; }
      visiveis.forEach(f=> listaEl.appendChild(criarItemEl(f)));
      atualizarEstatisticas();
    }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = titleInput.value.trim();
      const status = statusSelect.value === 'lido' ? 'lido' : 'desejo';
      if(!title) return;
      livros.unshift({id:Date.now(), title, status});
      titleInput.value='';statusSelect.value='desejo'; salvar(); render();
    });

   
    document.getElementById('filter-all').addEventListener('click', ()=>{filtro='todos'; render();});
    document.getElementById('filter-lidos').addEventListener('click', ()=>{filtro='lido'; render();});
    document.getElementById('filter-desejo').addEventListener('click', ()=>{filtro='desejo'; render();});
    document.getElementById('clear').addEventListener('click', ()=>{if(confirm('Limpar toda a lista?')){livros=[]; salvar(); render();}});

 
    render();
