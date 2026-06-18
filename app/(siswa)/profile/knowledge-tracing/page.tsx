'use client';

import React from 'react';
import { ArrowLeft, BrainCircuit, TrendingUp, Target, Award, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KnowledgeTracingDashboard() {
  const router = useRouter();

  // Mock Data for Skills
  const skills = [
    { name: 'Dasar Pemrograman', mastery: 90, color: 'bg-green-500', icon: <Award className="w-5 h-5 text-green-500" /> },
    { name: 'Struktur Data', mastery: 65, color: 'bg-blue-500', icon: <BrainCircuit className="w-5 h-5 text-blue-500" /> },
    { name: 'Algoritma Pencarian', mastery: 40, color: 'bg-yellow-500', icon: <Target className="w-5 h-5 text-yellow-500" /> },
    { name: 'Pemrograman Berorientasi Objek', mastery: 25, color: 'bg-red-500', icon: <TrendingUp className="w-5 h-5 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BrainCircuit className="w-8 h-8" />
              Knowledge Tracing Dashboard
            </h1>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Pantau perkembangan penguasaan konsep Anda secara real-time. Sistem DKT (Deep Knowledge Tracing) menganalisis setiap jawaban Anda untuk memetakan tingkat pemahaman Anda pada berbagai topik.
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Profil Kemampuan (Skill Mastery)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Progress Bars */}
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {skill.icon}
                        <span className="font-semibold text-gray-700">{skill.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{skill.mastery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${skill.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${skill.mastery}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {skill.mastery < 50 ? 'Perlu banyak latihan' : skill.mastery < 80 ? 'Sedang berkembang' : 'Sangat dikuasai'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Insights */}
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100 flex flex-col justify-center">
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Saran untuk Siswa
                </h3>
                <ul className="space-y-4 text-indigo-800 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-indigo-200 p-1 rounded-full"><Target className="w-3 h-3 text-indigo-700" /></div>
                    <span>Fokus utama Anda saat ini sebaiknya pada <strong>Pemrograman Berorientasi Objek</strong> karena penguasaan masih berada di angka 25%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-indigo-200 p-1 rounded-full"><Target className="w-3 h-3 text-indigo-700" /></div>
                    <span>Konsep <strong>Algoritma Pencarian</strong> menunjukkan sedikit kesulitan pada assessment terakhir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 bg-indigo-200 p-1 rounded-full"><Target className="w-3 h-3 text-indigo-700" /></div>
                    <span>Kerja bagus pada <strong>Dasar Pemrograman</strong>! Anda sudah siap untuk mengerjakan soal-soal tingkat lanjut.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
