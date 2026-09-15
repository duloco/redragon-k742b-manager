# Redragon K742B Manager (Arlokks)

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite)
![WebHID](https://img.shields.io/badge/API-WebHID-emerald.svg)
![Developer](https://img.shields.io/badge/Developer-Duloco-e53e3e.svg)

**Gerenciador não-oficial de código aberto para o teclado mecânico Redragon K742B (Arlokks) via WebHID & QMK.**

*Configure iluminação RGB em tempo real, remapeie teclas por camadas, teste switches com anti-ghosting (NKRO) e controle o Rotary Knob diretamente pelo navegador — sem necessidade de instalar drivers proprietários.*

</div>

---

## 🌟 Visão Geral

O **Redragon K742B Manager** foi desenvolvido por **Duloco** para oferecer uma experiência moderna, fluida e confiável de configuração e diagnóstico para o teclado mecânico **Redragon K742B (Arlokks)**. 

Utilizando a **API WebHID padrão do W3C**, a aplicação comunica-se diretamente com o firmware QMK/VIA do dispositivo através de relatórios Raw HID USB (Usage Page `0xFF60`), eliminando a necessidade de softwares pesados ou instaladores intrusivos.

---

## ✨ Funcionalidades Principais

### ⌨️ Teclado Virtual Interativo ABNT2
- **Layout Fiel ao Modelo Real**: Renderização com proporção precisa e alinhamento milimétrico da matriz de teclas (layout 94 teclas + Rotary Knob).
- **Tecla Enter ISO 3D**: Enter em formato de "L invertido" com sombreamento realista, gradiente linear e profundidade física (bisel inferior).
- **Alternância de Modos de Visualização**: Alterne entre o **Modo Interativo Vetorial** e a **Foto Oficial em Alta Resolução**.
- **Suporte a Múltiplas Camadas**: Alterne e personalize a **Camada 0 (Principal)** e a **Camada 1 (Fn Layer)**.
- **Seleção Dinâmica**: Clique em qualquer tecla para remapear; clique novamente para deselecionar com facilidade.

### 🎨 Controle de Iluminação RGB em Tempo Real
- **Sincronização Bidirecional com o Hardware**: Leitura automática do modo de iluminação ativo, brilho, velocidade e cor ao conectar o teclado.
- **Preview e Aplicação Instantânea**: Modos de iluminação clássicos QMK (*Solid Color, Breathing, Band, Rainbow, Cycle, Heatmap*, etc.).
- **Ajustes de Efeito**: Sliders responsivos para ajuste contínuo de brilho, velocidade e tempo de suspensão (*Sleep Time*).
- **Seletor de Cores RGB / HSV**: Cores personalizáveis com conversão nativa para o protocolo do hardware.

### 🎛️ Suporte Completo ao Rotary Knob
- **Detecção de Giro Físico**: Registra giros no sentido horário (*Volume +*) e anti-horário (*Volume -*) com animação visual de rotação e pulso de luz esmeralda.
- **Clique Central (Mute)**: Detecção imediata do clique físico para silenciar áudio.
- **Interatividade Virtual**: Gire o knob virtual utilizando a **roda de rolagem (scroll wheel) do mouse** ou os botões dedicados de teste.

### 🔍 Mapeamento Inteligente de Teclas
- **Destaque da Tecla Atual**: Ao selecionar uma tecla no teclado, o aplicativo localiza instantaneamente o keycode QMK correspondente no catálogo e destaca a opção com o selo **`✓ Mapeada`**.
- **Navegação Automática por Categorias**: Auto-scroll suave e troca automática para a categoria (*Basic, Media, Macro, Layers, Special, Lighting*).
- **Amplo Catálogo QMK**: Suporte a mais de 370 keycodes estruturados com códigos oficiais (`KC_*`).

### 🧪 Testador de Switches & NKRO (Anti-Ghosting)
- **Diagnóstico de Latência e Rollover**: Contador de teclas simultâneas (*N-Key Rollover*), total de teclas testadas e identificador da última tecla acionada.
- **Card de Teste do Knob**: Verificação dedicada para os estados de rotação e clique do codificador rotativo.
- **Bloqueio de Atalhos do Navegador**: Assegura que teclas especiais como `F1` (Ajuda), `F3` (Busca), `F5` / `Ctrl+R` (Recarregar), `Ctrl+P`, `Ctrl+S`, `Alt+Setas` e `Space/Setas` não disparem ações indesejadas do navegador durante os testes do teclado.
- **Filtro Anti-Ghosting do Windows (AltGr)**: Eliminação do falso evento sintético de `ControlLeft` emitido pelo driver de teclado do Windows quando o `Alt Direito (AltGr)` é pressionado.

---

## 🌐 Compatibilidade de Navegadores

A comunicação direta com o teclado exige um navegador com suporte à especificação **WebHID**:

| Navegador | Compatibilidade |
| :--- | :---: |
| **Google Chrome** | ✅ Versão 89+ |
| **Microsoft Edge** | ✅ Versão 89+ |
| **Brave Browser** | ✅ Versão 1.22+ |
| **Opera / Opera GX** | ✅ Versão 75+ |
| **Mozilla Firefox** | ❌ Não suporta WebHID nativo |
| **Apple Safari** | ❌ Não suporta WebHID nativo |

> [!TIP]
> Em distribuições Linux, pode ser necessário configurar uma regra `udev` para conceder permissão de leitura/escrita ao dispositivo USB Raw HID sem privilégios de root.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm` (incluso no Node.js).

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/redragon-k742b-manager.git
cd redragon-k742b-manager
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador compatível.

---

### Execução em Modo Standalone (Desktop Local)

Para compilar a versão otimizada de produção e servi-la na porta local `3420`:

```bash
# Compilar o bundle de produção
npm run build

# Iniciar o servidor desktop
node desktop-server.cjs
```
A aplicação iniciará na porta `http://localhost:3420`.

---

## 📁 Estrutura do Projeto

```text
k742b-app/
├── public/                     # Favicon, imagens e assets estáticos
│   └── images/                 # Foto oficial de alta resolução do K742B
├── src/
│   ├── components/             # Componentes React reutilizáveis
│   │   ├── Header.jsx          # Cabeçalho, status de conexão e perfis
│   │   ├── VirtualKeyboard.jsx # Teclado vetorial responsivo, Enter ISO e Knob
│   │   ├── KeyRemapTab.jsx     # Aba de remapeamento com destaque automático
│   │   ├── LightingTab.jsx     # Controles e sincronização RGB em tempo real
│   │   ├── KeyTesterTab.jsx    # Testador de switches, NKRO e diagnóstico do Knob
│   │   ├── MacroTab.jsx        # Configuração de macros
│   │   └── SettingsTab.jsx     # Ajustes gerais e informações de hardware
│   ├── services/               # Lógica de comunicação e dados
│   │   ├── qmkDriver.js        # Driver WebHID USB para Raw HID QMK (0xFF60)
│   │   ├── k742bLayout.js      # Matriz de layout físico e coordenadas das teclas
│   │   ├── domKeyMap.js        # Mapeamento estrito entre eventos DOM e o teclado
│   │   ├── keycodes.js         # Catálogo de keycodes QMK estruturados por categoria
│   │   └── colorUtils.js       # Conversores de cores HEX / RGB / HSV
│   ├── App.jsx                 # Componente raiz e gerenciamento de estado
│   └── index.css               # Sistema de design (glassmorphism e tema escuro)
├── desktop-server.cjs          # Servidor HTTP local leve para modo standalone
├── vite.config.js              # Configuração do Vite
└── package.json
```

---

## 👨‍💻 Desenvolvido por

Desenvolvido por **Duloco**

---

## 📜 Licença e Isenção de Responsabilidade (*Disclaimer*)

Este projeto está licenciado sob os termos da licença **MIT** — consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.

### Aviso Legal de Marca Registrada
- Este é um projeto independente, comunitário e **não-oficial**.
- **Não possui afiliação, patrocínio, endosso ou vínculo comercial** com a *Redragon*, *Eastern Times Technology Co., Ltd.* ou qualquer uma de suas subsidiárias.
- A marca **"Redragon"**, o logotipo e a imagem do modelo K742B são propriedades registradas de seus respectivos detentores de direitos autorais.

### Créditos e Agradecimentos
- À comunidade e desenvolvedores do [QMK Firmware](https://qmk.fm/) pelos padrões abertos de firmware para teclados mecânicos.
- Ao projeto [VIA (caniusevia.com)](https://caniusevia.com/) pelos conceitos de configuração dinâmica via Raw HID.
