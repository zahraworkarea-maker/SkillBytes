export interface Question {
  id: number
  question: string
  options: {
    id: string
    text: string
  }[]
  correctAnswer: string
  explanation?: string
}

export interface AssessmentData {
  id: string
  title: string
  description: string
  totalQuestions: number
  timeLimit: number // in minutes
  questions: Question[]
}

// Assessment data berdasarkan slug
export const assessmentDatabase: Record<string, AssessmentData> = {
  'l1-a1': {
    id: '1',
    title: 'Konsep Class dan Object',
    description: 'Mengukur pemahaman Anda tentang dasar-dasar class dan object dalam Object-Oriented Programming',
    totalQuestions: 10,
    timeLimit: 30,
    questions: [
    {
      id: 1,
      question: 'Apa yang dimaksud dengan Class dalam pemrograman OOP?',
      options: [
        { id: 'a', text: 'Sebuah blueprint atau template untuk membuat object' },
        { id: 'b', text: 'Sebuah variable yang menyimpan data' },
        { id: 'c', text: 'Sebuah fungsi yang menjalankan perintah' },
        { id: 'd', text: 'Sebuah library untuk analisis statistik' },
      ],
      correctAnswer: 'a',
      explanation: 'Class adalah blueprint atau template yang digunakan untuk membuat instance atau object.'
    },
    {
      id: 2,
      question: 'Apakah perbedaan antara Class dan Object?',
      options: [
        { id: 'a', text: 'Class adalah template, Object adalah instance dari class' },
        { id: 'b', text: 'Object lebih besar dari Class' },
        { id: 'c', text: 'Class dan Object adalah hal yang sama' },
        { id: 'd', text: 'Object tidak bisa mengakses Class' },
      ],
      correctAnswer: 'a',
      explanation: 'Class adalah blueprint logis, sementara Object adalah realisasi fisik dari class tersebut.'
    },
    {
      id: 3,
      question: 'Properti dalam sebuah class disebut juga dengan istilah apa?',
      options: [
        { id: 'a', text: 'Method' },
        { id: 'b', text: 'Attribute atau Member Variable' },
        { id: 'c', text: 'Constructor' },
        { id: 'd', text: 'Inheritance' },
      ],
      correctAnswer: 'b',
      explanation: 'Properti atau attribute adalah karakteristik yang dimiliki oleh object.'
    },
    {
      id: 4,
      question: 'Fungsi khusus yang dipanggil saat object dibuat disebut?',
      options: [
        { id: 'a', text: 'Destructor' },
        { id: 'b', text: 'Method' },
        { id: 'c', text: 'Constructor' },
        { id: 'd', text: 'Accessor' },
      ],
      correctAnswer: 'c',
      explanation: 'Constructor adalah method khusus yang dipanggil otomatis saat object dibuat.'
    },
    {
      id: 5,
      question: 'Berikut adalah contoh class dalam Python, KECUALI?',
      options: [
        { id: 'a', text: 'class Mobil: def __init__(self, warna):' },
        { id: 'b', text: 'class Rumah pass' },
        { id: 'c', text: 'def Hewan(): pass' },
        { id: 'd', text: 'class Komputer: pass' },
      ],
      correctAnswer: 'c',
      explanation: 'Pilihan (c) menggunakan def, bukan class. Kita harus menggunakan keyword "class" untuk mendefinisikan sebuah class.'
    },
    {
      id: 6,
      question: 'Akses modifier "private" dalam sebuah class berarti?',
      options: [
        { id: 'a', text: 'Dapat diakses dari mana saja' },
        { id: 'b', text: 'Hanya dapat diakses dari dalam class tersebut' },
        { id: 'c', text: 'Dapat diakses oleh class yang mewarisi' },
        { id: 'd', text: 'Dapat diakses hanya oleh package yang sama' },
      ],
      correctAnswer: 'b',
      explanation: 'Private member hanya bisa diakses dari dalam class itu sendiri, tidak dari luar.'
    },
    {
      id: 7,
      question: 'Method dalam sebuah class adalah?',
      options: [
        { id: 'a', text: 'Menyimpan data' },
        { id: 'b', text: 'Fungsi atau perilaku yang dimiliki object' },
        { id: 'c', text: 'Template untuk membuat object' },
        { id: 'd', text: 'Variabel global' },
      ],
      correctAnswer: 'b',
      explanation: 'Method adalah fungsi yang didefinisikan dalam class untuk menentukan perilaku object.'
    },
    {
      id: 8,
      question: 'Apa keuntungan menggunakan Encapsulation dalam OOP?',
      options: [
        { id: 'a', text: 'Membuat program lebih cepat' },
        { id: 'b', text: 'Melindungi data dan mengontrol akses ke data' },
        { id: 'c', text: 'Mengurangi ukuran file' },
        { id: 'd', text: 'Membuat program lebih mudah dipahami' },
      ],
      correctAnswer: 'b',
      explanation: 'Encapsulation melindungi integritas data dengan mengontrol bagaimana data diakses dan dimodifikasi.'
    },
    {
      id: 9,
      question: '"this" atau "self" dalam class merujuk pada?',
      options: [
        { id: 'a', text: 'Class itu sendiri' },
        { id: 'b', text: 'Instance atau object yang sedang berjalan' },
        { id: 'c', text: 'Parent class' },
        { id: 'd', text: 'Method dalam class' },
      ],
      correctAnswer: 'b',
      explanation: '"this" atau "self" adalah reference ke object yang sedang menggunakan method tersebut.'
    },
    {
      id: 10,
      question: 'Berapa banyak constructor yang dapat dimiliki oleh satu class?',
      options: [
        { id: 'a', text: 'Hanya satu' },
        { id: 'b', text: 'Maksimal dua' },
        { id: 'c', text: 'Banyak constructor (Constructor Overloading)' },
        { id: 'd', text: 'Tidak perlu constructor' },
      ],
      correctAnswer: 'c',
      explanation: 'Satu class dapat memiliki multiple constructor dengan parameter yang berbeda (Constructor Overloading).'
    },
    ],
  },
  'l1-a2': {
    id: '2',
    title: 'Constructor dan Destructor',
    description: 'Pelajari cara membuat dan menghancurkan objek dengan benar',
    totalQuestions: 8,
    timeLimit: 25,
    questions: [
      {
        id: 1,
        question: 'Apa fungsi utama dari Constructor?',
        options: [
          { id: 'a', text: 'Menghapus object dari memori' },
          { id: 'b', text: 'Menginisialisasi nilai awal object yang baru dibuat' },
          { id: 'c', text: 'Mengubah state object' },
          { id: 'd', text: 'Mencetak data object' },
        ],
        correctAnswer: 'b',
        explanation: 'Constructor digunakan untuk menginisialisasi properties object saat dibuat.'
      },
      {
        id: 2,
        question: 'Apakah Constructor harus memiliki return type?',
        options: [
          { id: 'a', text: 'Ya, harus return void' },
          { id: 'b', text: 'Ya, harus return object' },
          { id: 'c', text: 'Tidak, Constructor tidak memiliki return type' },
          { id: 'd', text: 'Tergantung dari bahasa pemrograman' },
        ],
        correctAnswer: 'c',
        explanation: 'Constructor tidak memiliki return type, bahkan tidak ada void.'
      },
      {
        id: 3,
        question: 'Destructor dalam Java disebut dengan apa?',
        options: [
          { id: 'a', text: 'finalize()' },
          { id: 'b', text: 'delete()' },
          { id: 'c', text: 'destroy()' },
          { id: 'd', text: 'Java tidak memiliki Destructor' },
        ],
        correctAnswer: 'd',
        explanation: 'Java menangani memory management secara otomatis melalui Garbage Collector.'
      },
      {
        id: 4,
        question: 'Parameter yang diterima Constructor disebut?',
        options: [
          { id: 'a', text: 'Arguments' },
          { id: 'b', text: 'Parameters atau Constructor Parameters' },
          { id: 'c', text: 'Attributes' },
          { id: 'd', text: 'Properties' },
        ],
        correctAnswer: 'b',
        explanation: 'Parameter Constructor digunakan untuk menerima nilai saat object dibuat.'
      },
      {
        id: 5,
        question: 'Bisakah Constructor memanggil Constructor lain?',
        options: [
          { id: 'a', text: 'Tidak, itu tidak diperbolehkan' },
          { id: 'b', text: 'Ya, menggunakan this() atau super()' },
          { id: 'c', text: 'Ya, tetapi hanya sekali' },
          { id: 'd', text: 'Hanya jika berada di class yang sama' },
        ],
        correctAnswer: 'b',
        explanation: 'Constructor bisa memanggil constructor lain dengan this() atau super().'
      },
      {
        id: 6,
        question: 'Apa yang terjadi jika class tidak memiliki Constructor?',
        options: [
          { id: 'a', text: 'Program akan error' },
          { id: 'b', text: 'Java akan membuat default Constructor' },
          { id: 'c', text: 'Object tidak bisa dibuat' },
          { id: 'd', text: 'Class harus abstract' },
        ],
        correctAnswer: 'b',
        explanation: 'Jika tidak ada Constructor, Java otomatis membuat default Constructor tanpa parameter.'
      },
      {
        id: 7,
        question: 'Constructor bisa memiliki akses modifier apa?',
        options: [
          { id: 'a', text: 'Hanya public' },
          { id: 'b', text: 'public, private, protected, dan package-private' },
          { id: 'c', text: 'private dan protected' },
          { id: 'd', text: 'public dan protected' },
        ],
        correctAnswer: 'b',
        explanation: 'Constructor bisa memiliki semua jenis akses modifier seperti method biasa.'
      },
      {
        id: 8,
        question: 'Bagaimana cara membuat Copy Constructor?',
        options: [
          { id: 'a', text: 'Constructor yang parameter-nya adalah object dari class yang sama' },
          { id: 'b', text: 'Constructor dengan parameter String' },
          { id: 'c', text: 'Constructor dengan dua parameter' },
          { id: 'd', text: 'Constructor static' },
        ],
        correctAnswer: 'a',
        explanation: 'Copy Constructor menerima object dari class yang sama sebagai parameter.'
      },
    ],
  },
  'l1-a3': {
    id: '3',
    title: 'Properties dan Methods',
    description: 'Menguasai atribut dan fungsi dalam class',
    totalQuestions: 9,
    timeLimit: 28,
    questions: [
      {
        id: 1,
        question: 'Apa perbedaan antara Instance Variable dan Class Variable?',
        options: [
          { id: 'a', text: 'Tidak ada perbedaan' },
          { id: 'b', text: 'Instance Variable unik per object, Class Variable dibagi semua object' },
          { id: 'c', text: 'Class Variable lebih cepat' },
          { id: 'd', text: 'Instance Variable hanya untuk integer' },
        ],
        correctAnswer: 'b',
        explanation: 'Instance Variable punya nilai berbeda per object, Class Variable (static) dibagi semua instance.'
      },
      {
        id: 2,
        question: 'Method yang tidak mengembalikan nilai menggunakan keyword?',
        options: [
          { id: 'a', text: 'return' },
          { id: 'b', text: 'void' },
          { id: 'c', text: 'null' },
          { id: 'd', text: 'empty' },
        ],
        correctAnswer: 'b',
        explanation: 'Method dengan return type void tidak mengembalikan nilai.'
      },
      {
        id: 3,
        question: 'Akses modifier method manakah yang paling terbatas?',
        options: [
          { id: 'a', text: 'protected' },
          { id: 'b', text: 'package-private' },
          { id: 'c', text: 'private' },
          { id: 'd', text: 'public' },
        ],
        correctAnswer: 'c',
        explanation: 'private adalah akses modifier paling terbatas, hanya bisa diakses dalam class itu sendiri.'
      },
      {
        id: 4,
        question: 'Method static dapat mengakses apa?',
        options: [
          { id: 'a', text: 'Hanya variable static' },
          { id: 'b', text: 'Semua variable dan method' },
          { id: 'c', text: 'Variable instance secara langsung' },
          { id: 'd', text: 'Method apa saja' },
        ],
        correctAnswer: 'a',
        explanation: 'Method static hanya bisa mengakses static variable dan method static.'
      },
      {
        id: 5,
        question: 'Getter method biasanya menggunakan naming convention?',
        options: [
          { id: 'a', text: 'setPropertyName()' },
          { id: 'b', text: 'getPropertyName()' },
          { id: 'c', text: 'propertyName()' },
          { id: 'd', text: 'is_property_name()' },
        ],
        correctAnswer: 'b',
        explanation: 'Getter method menggunakan naming convention get diikuti property name dengan capital case pertama.'
      },
      {
        id: 6,
        question: 'Method dengan parameter banyak dalam Java disebut?',
        options: [
          { id: 'a', text: 'Overloading' },
          { id: 'b', text: 'Overriding' },
          { id: 'c', text: 'Varargs' },
          { id: 'd', text: 'Parameters' },
        ],
        correctAnswer: 'c',
        explanation: 'Varargs (Variable Arguments) memungkinkan method menerima jumlah parameter tidak tetap.'
      },
      {
        id: 7,
        question: 'Bagaimana cara mengakses method dari object lain?',
        options: [
          { id: 'a', text: 'objectName.methodName()' },
          { id: 'b', text: 'methodName(objectName)' },
          { id: 'c', text: 'ClassName.methodName()' },
          { id: 'd', text: 'this.methodName()' },
        ],
        correctAnswer: 'a',
        explanation: 'Menggunakan dot notation: objectName.methodName() untuk memanggil method object lain.'
      },
      {
        id: 8,
        question: 'Return type dari method bisa berupa?',
        options: [
          { id: 'a', text: 'Hanya primitive type' },
          { id: 'b', text: 'Primitive type, Object, atau void' },
          { id: 'c', text: 'Hanya object' },
          { id: 'd', text: 'String saja' },
        ],
        correctAnswer: 'b',
        explanation: 'Return type bisa primitive type, object, array, atau void (tidak mengembalikan nilai).'
      },
      {
        id: 9,
        question: 'Method final dalam class berarti?',
        options: [
          { id: 'a', text: 'Method tidak bisa dipanggil' },
          { id: 'b', text: 'Method tidak bisa di-override oleh subclass' },
          { id: 'c', text: 'Method harus static' },
          { id: 'd', text: 'Method adalah method terakhir' },
        ],
        correctAnswer: 'b',
        explanation: 'Method final tidak bisa di-override (ditimpa) oleh subclass.'
      },
    ],
  },
}
