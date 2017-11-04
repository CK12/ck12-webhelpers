export function capitalizeWords(words){
    return words.split(' ')
        .map((word) => capitalize(word))
        .join(' ');
}

export function capitalize(word){
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}

export function stripHTML(str){
    return str.replace(/(<\/?\w+\/?>|<\/?(\w|\s|=|".*"|'.*')+\/?>)/gi, '');
}