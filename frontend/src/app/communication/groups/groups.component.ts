import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from './services/group.service';
import { UploadService } from './services/upload.service';
import { Group, GroupType, MemberRole } from './models/group.model';
import { forkJoin, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './groups.component.html',
    styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit {
    groups: Group[] = [];
    myGroups: Group[] = [];
    loading = false;
    error: string | null = null;
    showCreateModal = false;
    showEditModal = false;
    editingGroup: Group | null = null;
    currentUserId: string = ''; // ID MongoDB de l'utilisateur connecté

    // Formulaire de création
    newGroup = {
        name: '',
        description: '',
        groupType: GroupType.PUBLIC,
        maxMembers: undefined as number | undefined,
        isJoinable: true,
        coverImageUrl: ''
    };

    // Formulaire de modification
    editGroup = {
        name: '',
        description: '',
        groupType: GroupType.PUBLIC,
        maxMembers: undefined as number | undefined,
        isJoinable: true,
        coverImageUrl: ''
    };

    // Upload d'image
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    uploadingImage = false;

    GroupType = GroupType;
    MemberRole = MemberRole;

    constructor(
        private groupService: GroupService,
        private uploadService: UploadService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Récupérer l'ID de l'utilisateur connecté depuis le token JWT
        const token = sessionStorage.getItem('fakarni_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUserId = payload.sub; // L'ID MongoDB est dans le champ 'sub'
                console.log('Current user ID:', this.currentUserId);
            } catch (e) {
                console.error('Error parsing token:', e);
            }
        }
        
        this.loadAllData();
    }

    // Charger tous les groupes et mes groupes en parallèle
    loadAllData(): void {
        this.loading = true;
        this.error = null;

        forkJoin({
            allGroups: this.groupService.getAllGroups(false),
            myGroups: this.groupService.getUserGroups(this.currentUserId)
        }).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges(); // Force Angular to update the view
            })
        ).subscribe({
            next: (result) => {
                this.groups = result.allGroups;
                this.myGroups = result.myGroups;
                this.cdr.detectChanges(); // Force Angular to update the view
            },
            error: (err) => {
                this.error = 'Erreur lors du chargement des groupes';
                console.error(err);
                this.cdr.detectChanges();
            }
        });
    }

    openCreateModal(): void {
        this.showCreateModal = true;
        this.resetForm();
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.resetForm();
    }

    openEditModal(group: Group): void {
        this.editingGroup = group;
        this.editGroup = {
            name: group.name,
            description: group.description,
            groupType: group.groupType,
            maxMembers: group.maxMembers,
            isJoinable: group.isJoinable,
            coverImageUrl: group.coverImageUrl || ''
        };
        this.imagePreview = group.coverImageUrl || null;
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.editingGroup = null;
        this.resetEditForm();
    }

    // Gestion de l'upload d'image
    onFileSelected(event: any, isEdit: boolean = false): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(): void {
        this.selectedFile = null;
        this.imagePreview = null;
        this.newGroup.coverImageUrl = '';
        this.editGroup.coverImageUrl = '';
    }

    // Upload d'image réel
    private uploadImage(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.selectedFile) {
                console.log('📤 Upload fichier:', this.selectedFile.name, 'Taille:', this.selectedFile.size);
                this.uploadingImage = true;
                
                this.uploadService.uploadImage(this.selectedFile).subscribe({
                    next: (response) => {
                        console.log('✅ Réponse upload:', response);
                        this.uploadingImage = false;
                        // Retourner l'URL relative (le backend la servira)
                        resolve(response.url);
                    },
                    error: (err) => {
                        console.error('❌ Erreur upload service:', err);
                        this.uploadingImage = false;
                        this.error = 'Erreur lors de l\'upload de l\'image: ' + (err.error?.error || err.message);
                        reject(err);
                    }
                });
            } else {
                console.log('ℹ️ Pas de fichier à uploader');
                resolve('');
            }
        });
    }

    // Construire l'URL complète pour l'affichage
    getImageUrl(coverImageUrl: string): string {
        if (!coverImageUrl) {
            return '';
        }
        
        if (coverImageUrl.startsWith('http')) {
            return coverImageUrl;
        }
        
        return `${environment.apiUrl || ''}${coverImageUrl}`;
    }

    // Gérer les erreurs de chargement d'image
    onImageError(group: any): void {
        console.log('❌ Erreur chargement image pour groupe:', group.name);
        console.log('❌ URL problématique:', group.coverImageUrl);
        console.log('❌ URL construite:', this.getImageUrl(group.coverImageUrl));
    }

    createGroup(): void {
        if (!this.newGroup.name || !this.newGroup.description) {
            this.error = 'Veuillez remplir tous les champs obligatoires';
            return;
        }

        this.loading = true;
        this.error = null;

        // Créer le groupe d'abord, puis uploader l'image si nécessaire
        const groupData = {
            name: this.newGroup.name,
            description: this.newGroup.description,
            creatorId: this.currentUserId,
            groupType: this.newGroup.groupType,
            maxMembers: this.newGroup.maxMembers,
            isJoinable: this.newGroup.isJoinable,
            coverImageUrl: '' // Vide pour l'instant
        };
        
        this.groupService.createGroup(groupData).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (group) => {
                // Si une image est sélectionnée, l'uploader et mettre à jour le groupe
                if (this.selectedFile) {
                    this.uploadAndUpdateGroupImage(group);
                } else {
                    // Pas d'image, terminer la création
                    this.finishGroupCreation(group);
                }
            },
            error: (err) => {
                console.error('❌ Erreur création:', err);
                this.error = 'Erreur lors de la création du groupe: ' + (err.error?.message || err.message);
            }
        });
    }

    private uploadAndUpdateGroupImage(group: any): void {
        if (!this.selectedFile) {
            this.finishGroupCreation(group);
            return;
        }

        this.uploadingImage = true;

        this.uploadService.uploadImage(this.selectedFile).subscribe({
            next: (response) => {
                // Mettre à jour le groupe avec l'URL de l'image
                const updateData = {
                    name: group.name,
                    description: group.description,
                    groupType: group.groupType,
                    maxMembers: group.maxMembers,
                    isJoinable: group.isJoinable,
                    coverImageUrl: response.url // URL relative du backend
                };

                this.groupService.updateGroup(group.id, updateData).subscribe({
                    next: (updatedGroup) => {
                        this.uploadingImage = false;
                        this.finishGroupCreation(updatedGroup);
                    },
                    error: (err) => {
                        console.error('❌ Erreur mise à jour image:', err);
                        this.uploadingImage = false;
                        // Continuer même si l'image n'a pas pu être ajoutée
                        this.finishGroupCreation(group);
                    }
                });
            },
            error: (err) => {
                console.error('❌ Erreur upload image:', err);
                this.uploadingImage = false;
                // Continuer sans image
                this.finishGroupCreation(group);
            }
        });
    }

    private finishGroupCreation(group: any): void {
        // Mise à jour optimiste des listes
        this.groups.unshift(group);
        this.myGroups.unshift(group);
        
        // Force Angular to detect changes
        this.cdr.detectChanges();
        
        // Fermer le modal
        this.closeCreateModal();
        
        // Message de succès temporaire
        this.error = null;
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = `
            <i class="fa-solid fa-check-circle"></i> 
            Groupe "${group.name}" créé avec succès!
        `;
        document.querySelector('.groups-container')?.prepend(successMessage);
        
        // Supprimer le message après 3 secondes
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    updateGroup(): void {
        if (!this.editingGroup || !this.editGroup.name || !this.editGroup.description) {
            this.error = 'Veuillez remplir tous les champs obligatoires';
            return;
        }

        this.loading = true;
        this.error = null;

        // Si une nouvelle image est sélectionnée, l'uploader d'abord
        if (this.selectedFile) {
            console.log('📤 Upload nouvelle image...');
            this.uploadingImage = true;

            this.uploadService.uploadImage(this.selectedFile).subscribe({
                next: (response) => {
                    console.log('✅ Nouvelle image uploadée:', response);
                    this.uploadingImage = false;
                    
                    // Mettre à jour avec la nouvelle image
                    this.performGroupUpdate(response.url);
                },
                error: (err) => {
                    console.error('❌ Erreur upload nouvelle image:', err);
                    this.uploadingImage = false;
                    
                    // Continuer avec l'ancienne image
                    this.performGroupUpdate(this.editGroup.coverImageUrl);
                }
            });
        } else {
            // Pas de nouvelle image, utiliser l'existante
            this.performGroupUpdate(this.editGroup.coverImageUrl);
        }
    }

    private performGroupUpdate(imageUrl: string): void {
        const updateData = {
            name: this.editGroup.name,
            description: this.editGroup.description,
            groupType: this.editGroup.groupType,
            maxMembers: this.editGroup.maxMembers,
            isJoinable: this.editGroup.isJoinable,
            coverImageUrl: imageUrl
        };

        this.groupService.updateGroup(this.editingGroup!.id, updateData).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (updatedGroup) => {
                console.log('✅ Groupe modifié:', updatedGroup);
                
                // Mise à jour optimiste
                const index = this.groups.findIndex(g => g.id === updatedGroup.id);
                if (index !== -1) {
                    this.groups[index] = updatedGroup;
                }
                const myIndex = this.myGroups.findIndex(g => g.id === updatedGroup.id);
                if (myIndex !== -1) {
                    this.myGroups[myIndex] = updatedGroup;
                }
                
                // Force Angular to detect changes
                this.cdr.detectChanges();
                
                this.closeEditModal();
                
                // Message de succès temporaire
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.innerHTML = `
                    <i class="fa-solid fa-check-circle"></i> 
                    Groupe "${updatedGroup.name}" modifié avec succès!
                `;
                document.querySelector('.groups-container')?.prepend(successMessage);
                
                // Supprimer le message après 3 secondes
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            },
            error: (err) => {
                console.error('❌ Erreur modification:', err);
                this.error = 'Erreur lors de la modification du groupe: ' + (err.error?.message || err.message);
            }
        });
    }

    joinGroup(groupId: number): void {
        this.groupService.addMember(groupId, {
            userId: this.currentUserId,
            role: MemberRole.MEMBER
        }).subscribe({
            next: () => {
                // Mise à jour optimiste - déplacer le groupe vers myGroups
                const group = this.groups.find(g => g.id === groupId);
                if (group && !this.myGroups.find(g => g.id === groupId)) {
                    this.myGroups.unshift(group);
                    // Incrémenter le compteur de membres
                    group.memberCount++;
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Erreur lors de l\'adhésion au groupe';
                console.error(err);
            }
        });
    }

    leaveGroup(groupId: number): void {
        if (confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) {
            this.groupService.removeMember(groupId, this.currentUserId).subscribe({
                next: () => {
                    // Mise à jour optimiste - retirer de myGroups
                    this.myGroups = this.myGroups.filter(g => g.id !== groupId);
                    // Décrémenter le compteur de membres
                    const group = this.groups.find(g => g.id === groupId);
                    if (group) {
                        group.memberCount--;
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.error = 'Erreur lors de la sortie du groupe';
                    console.error(err);
                }
            });
        }
    }

    viewGroupDetails(groupId: number): void {
        this.router.navigate(['/communication/groups', groupId]);
    }

    isMyGroup(groupId: number): boolean {
        return this.myGroups.some(g => g.id === groupId);
    }

    isCreator(group: Group): boolean {
        return group.creatorId === this.currentUserId;
    }

    isFormValid(): boolean {
        if (this.showCreateModal) {
            return !!(this.newGroup.name && this.newGroup.name.trim() && 
                      this.newGroup.description && this.newGroup.description.trim());
        } else if (this.showEditModal) {
            return !!(this.editGroup.name && this.editGroup.name.trim() && 
                      this.editGroup.description && this.editGroup.description.trim());
        }
        return false;
    }

    private resetForm(): void {
        this.newGroup = {
            name: '',
            description: '',
            groupType: GroupType.PUBLIC,
            maxMembers: undefined,
            isJoinable: true,
            coverImageUrl: ''
        };
        this.selectedFile = null;
        this.imagePreview = null;
    }

    private resetEditForm(): void {
        this.editGroup = {
            name: '',
            description: '',
            groupType: GroupType.PUBLIC,
            maxMembers: undefined,
            isJoinable: true,
            coverImageUrl: ''
        };
        this.selectedFile = null;
        this.imagePreview = null;
    }
}
