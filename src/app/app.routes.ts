import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { SubirGrabarComponent } from './pages/subir-grabar/subir-grabar.component';
import { RecortarFragmentoComponent } from './pages/recortar-fragmento/recortar-fragmento.component';
import { ProcesandoComponent } from './pages/procesando/procesando.component';
import { ResultadosComponent } from './pages/resultados/resultados.component';
import { FrameDelTiroComponent } from './pages/frame-del-tiro/frame-del-tiro.component';
import { HistorialGuardadoComponent } from './pages/historial-guardado/historial-guardado.component';
import { CompararComponent } from './pages/comparar/comparar.component';

export const routes: Routes = [
  { path: '',                   component: InicioComponent },
  { path: 'configuracion',      component: ConfiguracionComponent },
  { path: 'subir',              component: SubirGrabarComponent },
  { path: 'recortar',           component: RecortarFragmentoComponent },
  { path: 'procesando/:id',     component: ProcesandoComponent },
  { path: 'resultados/:id',     component: ResultadosComponent },
  { path: 'tiro/:id/:shotIdx',  component: FrameDelTiroComponent },
  { path: 'historial',          component: HistorialGuardadoComponent },
  { path: 'comparar',           component: CompararComponent },
  { path: '**',                 redirectTo: '' },
];
