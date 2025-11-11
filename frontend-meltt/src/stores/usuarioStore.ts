import { makeAutoObservable } from 'mobx';

class UsuarioStore {
  usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

  constructor() {
    makeAutoObservable(this);
  }

  setUsuario(usuario: any) {
    this.usuarioLogado = usuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }

  limparUsuario() {
    this.usuarioLogado = null;
    localStorage.removeItem('usuarioLogado');
  }
}


const usuarioStore = new UsuarioStore();
export default usuarioStore;
