
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { UserProfile, AvatarId } from '../types';
import { MASCOT_DATA } from '../components/Mascot';
import { Save, Upload, Download, User, Shield, Zap, FileText } from 'lucide-react';

export const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
    const [importData, setImportData] = useState('');
    const [activeTab, setActiveTab] = useState<'ID' | 'SYNC'>('ID');

    const handleSaveProfile = () => {
        StorageService.saveProfile(profile);
        alert("Perfil actualizado.");
    };

    const handleExport = () => {
        const data = StorageService.exportData();
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus_backup_${profile.username}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    };

    const handleImportText = () => {
        if (!importData) return;
        processImport(importData);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                processImport(content);
            }
        };
        reader.readAsText(file);
    };

    const processImport = (data: string) => {
        const result = StorageService.mergeData(data);
        if (result.success) {
            alert(`¡Sincronización Neural Completada!\n\nResumen de fusión:\n${result.details}`);
            window.location.reload();
        } else {
            alert("Error crítico: El archivo de seguridad está corrupto o es incompatible.");
        }
    };

    // Safety fallback to prevent crash if avatarId is invalid (e.g. from old 'hero' default)
    const currentMascot = MASCOT_DATA[profile.avatarId || 'deadpool'] || MASCOT_DATA['deadpool'];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Header */}
             <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-8 shadow-xl">
                <div className={`absolute inset-0 ${currentMascot.primaryColor} opacity-90`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-10">
                     <div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                            <User size={32} /> Agente: {profile.username}
                        </h1>
                        <p className="text-white/80 font-mono text-sm">ID: {Date.now().toString().slice(-8)} // NIVEL {StorageService.getStats().level}</p>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar / Tabs */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <div className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('ID')}
                            className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 transition-all ${activeTab === 'ID' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Shield size={18} /> Identidad
                        </button>
                        <button 
                            onClick={() => setActiveTab('SYNC')}
                            className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 transition-all ${activeTab === 'SYNC' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Zap size={18} /> Neural Link (Sync)
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                    {activeTab === 'ID' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Configuración de Agente</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Codename</label>
                                    <input 
                                        type="text" 
                                        value={profile.username}
                                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avatar de IA Asignado</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {(Object.keys(MASCOT_DATA) as AvatarId[]).map(id => (
                                            <button 
                                                key={id}
                                                onClick={() => setProfile({...profile, avatarId: id})}
                                                className={`aspect-square rounded-xl border-2 transition-all relative overflow-hidden ${profile.avatarId === id ? 'border-slate-800 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                title={MASCOT_DATA[id].name}
                                            >
                                                <div className={`w-full h-full ${MASCOT_DATA[id].primaryColor}`}></div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Selecciona tu IA compañera predeterminada.</p>
                                </div>

                                <button 
                                    onClick={handleSaveProfile}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                                >
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SYNC' && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Neural Cloud Sync (Manual)</h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Nexus AI es segura y privada. Tus datos viven en tu dispositivo. Para mover tu progreso a otro ordenador o móvil, usa este sistema de backup.
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                {/* EXPORT */}
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><Download size={18} /> Exportar Progreso</h3>
                                        <p className="text-blue-600/80 text-xs mb-4">Descarga un archivo <code>.txt</code> encriptado con tu XP, Vocabulario, Gramática y Exámenes.</p>
                                        <button onClick={handleExport} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-200">
                                            Descargar Archivo de Backup
                                        </button>
                                    </div>
                                    <Download size={100} className="absolute -right-4 -bottom-4 text-blue-100 opacity-50 rotate-[-15deg]" />
                                </div>

                                {/* IMPORT */}
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden">
                                     <div className="relative z-10">
                                        <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Upload size={18} /> Restaurar Progreso</h3>
                                        <p className="text-emerald-600/80 text-xs mb-4">Sube tu archivo de backup para fusionarlo con este dispositivo.</p>
                                        
                                        <div className="space-y-4">
                                            {/* File Upload Button */}
                                            <div className="flex items-center gap-3">
                                                <label className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2">
                                                    <FileText size={16} /> Seleccionar Archivo
                                                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                                                </label>
                                                <span className="text-emerald-600 text-xs font-medium">o pega el código abajo</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <input 
                                                    value={importData}
                                                    onChange={(e) => setImportData(e.target.value)}
                                                    placeholder="...o pega la cadena base64 aquí"
                                                    className="flex-1 p-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                                <button onClick={handleImportText} className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-200">
                                                    Procesar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <Upload size={100} className="absolute -right-4 -bottom-4 text-emerald-100 opacity-50 rotate-[-15deg]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
