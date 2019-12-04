// console.log("hello")
// let fs = require('fs')
let MAX_SENTENCE_LENGTH = 1000
let EXP_TABLE_SIZE = 1000
let MAX_EXP = 6
// let MAX_CODE_LENGTH = 40
let iter = 5
let train_file = "text9"
// let train_file = "text8"
let vocab = []
let vocab_hash = []
let vocab_size = 0
// let vocab_hash_size = 3000//30000000
let vocab_hash_size = 30000000
let layer1_size = 2
// let layer1_size = 100
let syn0 = []
let syn1 = []
let expTable = []
let alpha = 0.025
let word_count_actual = 0
let train_words = 0
let starting_alpha = alpha
let window = 5
let hs = 1
export {alpha, vocab_hash}
// let strs = []

import strs from "./static/textfull.json"
import { SSL_OP_EPHEMERAL_RSA } from "constants"

export function test() {
    console.log("export successful")
}

// var fs = require('fs');

// 打开一个流:
// let rs = fs.createReadStream(train_file, 'utf-8');
// let ws1 = fs.createWriteStream('output1.txt', 'utf-8');
// let ve = fs.createWriteStream('vector.txt', 'utf-8');
// LearnVocabFromTrainFile()
main()

onmessage = function (e) {
    console.log('received Message:' + e.data)
    // postMessage("push")
}

export function main() {
    // obj.alpha = alpha
    // 计算sigmoid值
    for (let i = 0; i < EXP_TABLE_SIZE; i++) {
        expTable[i] = Math.exp((i / EXP_TABLE_SIZE * 2 - 1) * MAX_EXP); // Precompute the exp() table
        expTable[i] = expTable[i] / (expTable[i] + 1);                 // Precompute f(x) = x / (x + 1)
    }
    // expTable = (real *)malloc((EXP_TABLE_SIZE + 1) * sizeof(real));// 申请EXP_TABLE_SIZE+1个空间
    LearnVocabFromTrainFile()


    // 开始模型训练
    // TrainModel();// 模型训练
    console.log("CreateBinaryTree")
    CreateBinaryTree()
    InitNet()
    console.log("TrainModelThread")
    TrainModelThread()
    // console.log("saveWordVectors")
    // saveWordVectors()
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Adds a word to the vocabulary
// 为词库中增加一个词
function AddWordToVocab(word) {
    // unsigned int hash, length = strlen(word) + 1;// 单词的长度+1
    let hash
    // if (length > MAX_STRING) length = MAX_STRING;
    // vocab[vocab_size].word = (char *)calloc(length, sizeof(char));//开始的位置增加指定的词
    // vocab[vocab_size].word = word
    vocab[vocab_size] = { word: word, cn: 0 }
    // vocab[vocab_size].cn = 0;
    vocab_size++;
    // // Reallocate memory if needed
    // if (vocab_size + 2 >= vocab_max_size) {
    // 	vocab_max_size += 1000;
    // 	vocab = (struct vocab_word *)realloc(vocab, vocab_max_size * sizeof(struct vocab_word));
    // }
    hash = GetWordHash(word);// 对增加的词hash
    while (vocab_hash[hash] != -1) hash = (hash + 1) % vocab_hash_size;// hash的碰撞检测
    vocab_hash[hash] = vocab_size - 1;// 词的hash值->词的词库中的索引
    return vocab_size - 1;
}


// Returns hash value of a word
// 取词的hash值
function GetWordHash(word) {
    let hash = 0
    for (let char in word) hash = hash * 257 + char.charCodeAt()
    hash = hash % vocab_hash_size
    return hash
}

// Returns position of a word in the vocabulary; if the word is not found, returns -1
// 查找词在词库中的位置，若没有查找到则返回-1
function SearchVocab(word) {
    let hash = GetWordHash(word);
    while (true) {
        if (vocab_hash[hash] == -1) return -1;// 不存在该词
        if (word == vocab[vocab_hash[hash]].word) return vocab_hash[hash];// 返回索引值
        hash = (hash + 1) % vocab_hash_size;
    }
    return -1;// 不存在该词
}

function SortVocab() {
    let a, size
    let hash

    vocab.sort(function (x, y) {
        if (x.cn == 0) {
            return -1;
        } else if (y.cn == 0) {
            return 1;
        } else {
            return y.cn - x.cn;
        }
    })

    // 排完序后需要重新做hash运算
    for (a = 0; a < vocab_hash_size; a++) vocab_hash[a] = -1;
    size = vocab_size;
    train_words = 0;
    for (a = 0; a < size; a++) {
        // Hash will be re-computed, as after the sorting it is not actual
        hash = GetWordHash(vocab[a].word);
        while (vocab_hash[hash] != -1) {
            hash = (hash + 1) % vocab_hash_size;
        }
        vocab_hash[hash] = a;
        train_words += vocab[a].cn;
    }
}
// 读取输入的文件，并从输入文件中构建词库
function LearnVocabFromTrainFile() {
    // rs.on('data', function (chunk) {
    //     console.log('DATA:')
    //     // console.log(chunk);
    //     strs += String(chunk)
    // });

    // strs = strs.split(" ")
    train_words = strs.length
    
    console.log("itrain_words: " + train_words)
    // console.log(strs)
    console.log("vocab_hash")
    for (let a = 0; a < vocab_hash_size; a++) vocab_hash[a] = -1; // 初始化
    console.log("AddWordToVocab")
    AddWordToVocab("</s>")
    for (let index in strs) {
        let str = strs[index]
        if (index % 10000 == 0) {
            console.log("index:" + index)
        } else if (index == 300001) {
            break
        }
        // if(str == " "){
        //     console.log("str kong")
        //     continue
        // }
        // console.log(str)
        let i = SearchVocab(str);// 查找词在词库中的位置
        // console.log("i: " + i)
        if (i == -1) {// 没有查找到对应的词
            let a = AddWordToVocab(str);// 增加词
            vocab[a].cn = 1;// 设置词出现的次数为1
        } else vocab[i].cn++;// 设置词出现的次数+1
    }
    postMessage(["totalWords", vocab_size])
    // // 根据当前词的个数和设定的hash表的大小，删除低频词
    // if (vocab_size > vocab_hash_size * 0.7) ReduceVocab();

    // 根据词出现的频率对词进行排序
    SortVocab();
    // let hashtemp = GetWordHash("the")
    // console.log("one hashtemp:" + hashtemp)
    // hashtemp = GetWordHash("one")
    // console.log("the hashtemp:" + hashtemp)
    // let indextemp = vocab_hash[hashtemp]
    let indextemp = SearchVocab("north")
    console.log("indextemp:" + indextemp)
    console.log("test if index right: " + vocab[indextemp].word)


    // console.log("vocab: " + vocab)
    // console.log("write vocab")
    // for (let i = 0; i < vocab.length; i++) {
    //     // console.log("" + vocab[i].word + " " + vocab[i].cn + "\n")
    //     ws1.write("" + vocab[i].word + " " + vocab[i].cn + "\n")
    //     // ws1.end()
    // }
    // console.log("CreateBinaryTree")
    // CreateBinaryTree()
    // console.log("InitNet")
    // InitNet()
    // console.log("TrainModelThread")
    // TrainModelThread()
    // console.log("saveWordVectors")
    // saveWordVectors()

    // rs.on('end', function () {
    //     console.log('END');

    // });

    // rs.on('error', function (err) {
    //     console.log('ERROR: ' + err);
    // });
}


// Create binary Huffman tree using the word counts
// Frequent words will have short uniqe binary codes
// 根据词库中的词频构建Huffman树
function CreateBinaryTree() {
    let a, b, i, min1i, min2i, pos1, pos2
    let point = []
    let code = []

    // 申请2倍的词的空间，（在这里完全没有必要申请这么多的空间）
    // long long *count = (long long *)calloc(vocab_size * 2 + 1, sizeof(long long));
    // long long *binary = (long long *)calloc(vocab_size * 2 + 1, sizeof(long long));
    // long long *parent_node = (long long *)calloc(vocab_size * 2 + 1, sizeof(long long));
    let count = []
    let binary = []
    let parent_node = []

    // 分成两半进行初始化
    for (a = 0; a < vocab_size; a++) count[a] = vocab[a].cn// 前半部分初始化为每个词出现的次数
    for (a = vocab_size; a < vocab_size * 2; a++) count[a] = 1e15// 后半部分初始化为一个固定的常数

    for (a = 0; a < vocab_size * 2 + 1; a++) {
        binary[a] = 0
        // count[a] = 0
        // parent_node[a] = 0
    }
    // 两个指针：
    // pos1指向前半截的尾部
    // pos2指向后半截的开始
    pos1 = vocab_size - 1
    pos2 = vocab_size

    // Following algorithm constructs the Huffman tree by adding one node at a time
    // 每次增加一个节点，构建Huffman树
    for (a = 0; a < vocab_size - 1; a++) {
        // First, find two smallest nodes 'min1, min2'
        // 选择最小的节点min1
        if (pos1 >= 0) {
            if (count[pos1] < count[pos2]) {
                min1i = pos1;
                pos1--;
            } else {
                min1i = pos2;
                pos2++;
            }
        } else {
            min1i = pos2;
            pos2++;
        }
        // 选择最小的节点min2
        if (pos1 >= 0) {
            if (count[pos1] < count[pos2]) {
                min2i = pos1;
                pos1--;
            } else {
                min2i = pos2;
                pos2++;
            }
        } else {
            min2i = pos2;
            pos2++;
        }

        count[vocab_size + a] = count[min1i] + count[min2i];
        // 设置父节点
        parent_node[min1i] = vocab_size + a;
        parent_node[min2i] = vocab_size + a;
        binary[min2i] = 1;// 设置一个子树的编码为1
    }
    // Now assign binary code to each vocabulary word
    // 为每一个词分配二进制编码，即Huffman编码
    for (a = 0; a < vocab_size; a++) {// 针对每一个词
        b = a;
        i = 0;
        while (1) {
            code[i] = binary[b];// 找到当前的节点的编码
            point[i] = b;// 记录从叶子节点到根结点的序列
            i++;
            b = parent_node[b];// 找到当前节点的父节点
            if (b == vocab_size * 2 - 2) break;// 已经找到了根结点，根节点是没有编码的
        }
        vocab[a].codelen = i;// 词的编码长度
        vocab[a].point = []
        vocab[a].code = []
        vocab[a].point[0] = vocab_size - 2;// 根结点
        for (b = 0; b < i; b++) {
            vocab[a].code[i - b - 1] = code[b];// 编码的反转
            vocab[a].point[i - b] = point[b] - vocab_size;// 记录的是从根结点到叶子节点的路径
        }
    }

    //test1
    console.log("vocab[1].word:" + vocab[1].word)
    console.log("vocab[1].code:" + vocab[1].code)
    console.log("vocab[1].point:" + vocab[1].point)
    //test2
    console.log("vocab[2].word:" + vocab[2].word)
    console.log("vocab[2].code:" + vocab[2].code)
    console.log("vocab[2].point:" + vocab[2].point)

    // free(count);
    // free(binary);
    // free(parent_node);
}



function InitNet() {
    let a, b
    let next_random = 1;

    // 为每一个词分配词向量的空间
    // 对齐分配内存,posix_memalign函数的用法类似于malloc的用法，最后一个参数的分配的内存的大小
    // a = posix_memalign((void **)&syn0, 128, (long long)vocab_size * layer1_size * sizeof(real));
    // if (syn0 == NULL) {printf("Memory allocation failed\n"); exit(1);}

    // 层次softmax的结构
    if (hs) {
        // 映射层到输出层之间的权重
        // a = posix_memalign((void **)&syn1, 128, (long long)vocab_size * layer1_size * sizeof(real));
        // if (syn1 == NULL) {printf("Memory allocation failed\n"); exit(1);}
        for (a = 0; a < vocab_size; a++) {
            for (b = 0; b < layer1_size; b++) {
                syn1[a * layer1_size + b] = 0;// 权重初始化为0
            }
        }
    }

    // 负采样的结构
    // if (negative>0) {
    // 	// a = posix_memalign((void **)&syn1neg, 128, (long long)vocab_size * layer1_size * sizeof(real));
    // 	if (syn1neg == NULL) {printf("Memory allocation failed\n"); exit(1);}
    // 	for (a = 0; a < vocab_size; a++) for (b = 0; b < layer1_size; b++)
    // 		syn1neg[a * layer1_size + b] = 0;
    // }

    // 随机初始化
    for (a = 0; a < vocab_size; a++) {
        for (b = 0; b < layer1_size; b++) {
            next_random = next_random * 25214903917 + 11;
            // 1、与：相当于将数控制在一定范围内
            // 2、0xFFFF：65536
            // 3、/65536：[0,1]之间
            syn0[a * layer1_size + b] = (((next_random & 0xFFFF) / 65536) - 0.5) / layer1_size;// 初始化词向量
        }
    }

    // 构建Huffman树
    // CreateBinaryTree();
}



function TrainModelThread() {
    let a, b, d, cw, word, last_word, sentence_length = 0, sentence_position = 0
    let word_count = 0, last_word_count = 0
    let sen = []
    let l1, l2, c, target, label, local_iter = iter
    // let next_random = 1
    let f, g
    // clock_t now

    // 存储映射层的结果
    let neu1 = []
    // skip-gram中使用到的向量
    let neu1e = []

    // FILE *fi = fopen(train_file, "rb");
    // fs.readFileSync(train_file, data)
    // // 利用多线程对训练文件划分，每个线程训练一部分的数据
    // fseek(fi, file_size / (long long)num_threads * (long long)id, SEEK_SET);

    let strs_beg = 0
    while (1) {
        // 每处理10000个词重新计算学习率
        if (word_count - last_word_count > 10000) {
            word_count_actual += word_count - last_word_count;
            last_word_count = word_count;

            // 重新计算alpha的值
            alpha = starting_alpha * (1 - word_count_actual / (iter * train_words + 1))
            // 防止学习率过小
            if (alpha < starting_alpha * 0.0001) alpha = starting_alpha * 0.0001

            console.log("alpha:" + alpha)
            postMessage(["alpha", alpha])
            postMessage(["trainedWords", word_count])
            // obj.alpha = alpha
            // self.$forceUpdate()
            // sleep(500)
        }

        // sentence_length=0表示的是当前还没有读取文本
        // 开始读取文本，读取词的个数最多为MAX_SENTENCE_LENGTH
        if (sentence_length == 0) {
            // 需要根据文件指针的位置读取相应的文本
            let strs_end = 0
            if (train_words > strs_beg + MAX_SENTENCE_LENGTH) {
                strs_end = strs_beg + MAX_SENTENCE_LENGTH
            } else {
                strs_end = train_words
            }
            let strs_temp = strs.slice(strs_beg, strs_end)
            strs_beg = strs_end
            for (const index in strs_temp) {
                let data = strs_temp[index]
                word = SearchVocab(data)
                if (word == -1) continue;// 没有查到该词
                word_count++;

                if (word == 0) break;
                sen[sentence_length] = word;// 存储词在词库中的位置，word代表的是Index
                sentence_length++;
            }

            // while (1) {
            //     //要迭代local_iter次，需要重置使其重新开始读取并训练
            //     // word = ReadWordIndex(fi);// 词在词库中的索引l
            //     let word

            //     //////////////////////////////////////////////////////
            //     // let readLine = require('lei-stream').readLine;

            //     // // readLineStream第一个参数为ReadStream实例，也可以为文件名
            //     // let s = readLine(fs.createReadStream('text8'), {
            //     //     // 换行符，默认\n
            //     //     newline: ' ',
            //     //     // 是否自动读取下一行，默认false
            //     //     autoNext: false,
            //     //     // 编码器，可以为函数或字符串（内置编码器：json，base64），默认null
            //     // });

            //     // // 读取到一行数据时触发data事件
            //     // s.on('data', function (data) {
            //     //     // console.log(data);
            //     //     word = SearchVocab(data)
            //     //     s.next();
            //     // });

            //     // // 流结束时触发end事件
            //     // s.on('end', function () {
            //     //     console.log('end aaa');
            //     // });
            //     //////////////////////////////////////////////////////
            //     // if (feof(fi)) break;
            //     if (word == -1) continue;// 没有查到该词
            //     word_count++;

            //     if (word == 0) break;

            //     // // The subsampling randomly discards frequent words while keeping the ranking same
            //     // if (sample > 0) {
            //     //     ran = (sqrt(vocab[word].cn / (sample * train_words)) + 1) * (sample * train_words) / vocab[word].cn;
            //     //     next_random = next_random * 25214903917 + 11;
            //     //     if (ran < (next_random & 0xFFFF) / 65536) continue;
            //     // }

            //     sen[sentence_length] = word;// 存储词在词库中的位置，word代表的是Index
            //     sentence_length++;
            //     if (sentence_length >= MAX_SENTENCE_LENGTH) break;// 达到指定长度
            // }
            sentence_position = 0;// 将待处理的文本指针置0
        }

        // 当前的线程已经处理完分配给该线程的文本
        if (strs_beg === train_words) {// 当前线程已经读完数据
            word_count_actual += word_count - last_word_count;
            // 当前线程的迭代次数
            local_iter--;
            console.log("remain local_iter:" + local_iter)
            if (local_iter == 0) break;// 迭代结束
            // 重新置0，准备下一次重新迭代
            word_count = 0;
            last_word_count = 0;
            sentence_length = 0;
            // 重置文件指针
            // fseek(fi, file_size / (long long)num_threads * (long long)id, SEEK_SET);
            strs_beg = 0
            postMessage(["iters", iter - local_iter])
            continue;
        }

        // sen表示的是当前的线程读取到的每一个词对应在词库中的索引
        word = sen[sentence_position];//sentence_position表示的是当前词
        if (word == -1) continue;

        // 初始化映射层
        for (c = 0; c < layer1_size; c++) neu1[c] = 0;// 映射层的结果
        for (c = 0; c < layer1_size; c++) neu1e[c] = 0;

        // 产生一个0~window-1的随机数
        // next_random = next_random * 25214903917 + 11;
        // b = next_random % window;

        b = getRandomInt(window)
        // console.log("b:" + b)
        // 模型的训练
        {  //train skip-gram 训练skip-gram模型
            for (a = b; a < window * 2 + 1 - b; a++) if (a != window) {
                c = sentence_position - window + a;
                if (c < 0) continue;
                if (c >= sentence_length) continue;
                last_word = sen[c];
                if (last_word == -1) continue;
                l1 = last_word * layer1_size;
                for (c = 0; c < layer1_size; c++) neu1e[c] = 0;
                // HIERARCHICAL SOFTMAX
                if (hs) for (d = 0; d < vocab[word].codelen; d++) {
                    f = 0;
                    l2 = vocab[word].point[d] * layer1_size;
                    // Propagate hidden -> output
                    // 映射层即为输入层
                    for (c = 0; c < layer1_size; c++) f += syn0[c + l1] * syn1[c + l2];

                    if (f <= -MAX_EXP) continue;
                    else if (f >= MAX_EXP) continue;
                    else f = expTable[parseInt((f + MAX_EXP) * (EXP_TABLE_SIZE / MAX_EXP / 2))];

                    // 'g' is the gradient multiplied by the learning rate
                    g = (1 - vocab[word].code[d] - f) * alpha;
                    // Propagate errors output -> hidden
                    for (c = 0; c < layer1_size; c++) neu1e[c] += g * syn1[c + l2];
                    // Learn weights hidden -> output
                    for (c = 0; c < layer1_size; c++) syn1[c + l2] += g * syn0[c + l1];
                }
                // Learn weights input -> hidden
                for (c = 0; c < layer1_size; c++) syn0[c + l1] += neu1e[c];
            }
        }
        // 当已经处理完读入的所有文本，要重新继续往下读文本
        sentence_position++;
        if (sentence_position >= sentence_length) {
            sentence_length = 0;
            continue;
        }

    }
}

function saveWordVectors() {
    // console.log("saveWordVectors")
    console.log("vocab_size:" + vocab_size + ", layer1_size" + layer1_size)
    // fprintf(fo, "%lld %lld\n", vocab_size, layer1_size);
    for (a = 0; a < vocab_size; a++) {
        ve.write("" + vocab[a].word + " ")
        // fprintf(fo, "%s ", vocab[a].word);
        for (b = 0; b < layer1_size; b++) {
            ve.write("" + syn0[a * layer1_size + b] + " ")
            // fprintf(fo, "%lf ", syn0[a * layer1_size + b]);
        }
        ve.write("\n")
        // fprintf(fo, "\n");
    }
}



