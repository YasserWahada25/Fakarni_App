import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionEventLayoutComponent } from './components/session-event-layout/session-event-layout.component';

const routes: Routes = [
    {
        path: '',
        component: SessionEventLayoutComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SessionEventRoutingModule { }
