<div align="center">

# 📝 Commitable

![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0.39-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9.0-7F52FF?style=flat-square&logo=kotlin&logoColor=white)
![Android](https://img.shields.io/badge/Android-API_34-3DDC84?style=flat-square&logo=android&logoColor=white)

> Um aplicativo mobile para tracking de hábitos com visualização estilo GitHub contribution grid.

</div>

## ✨ Features

- ✅ **CRUD de hábitos** - Crie, edite e remova seus hábitos
- 🎨 **Cores customizáveis** - Escolha entre 5 cores diferentes para cada hábito
- 📊 **Grid de contribuições** - Visualização estilo GitHub contribution graph
- 🔌 **Conectores externos** - Integre com APIs que retornam dados de commits
- 📱 **Widget Android** - Widget nativo na tela inicial com grid de commits
- 💾 **Persistência local** - Dados salvos com AsyncStorage

## 🚀 Tech Stack

| Tecnologia | Uso |
|------------|-----|
| React Native + Expo | Framework principal |
| TypeScript | Tipagem estática |
| AsyncStorage | Persistência local |
| react-native-shared-preferences | Comunicação com widget Android |
| Kotlin | Widget nativo Android |

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/commitable.git
cd commitable

# Instale as dependências
npm install

# Execute o app
npx expo start