function bulkCreate(){
	let input = document.getElementById("input").value.trim()
	let pattern = document.getElementById("pattern").value
	let outputElm = document.getElementById("output")
	
	let csv = {};
	let entry = '';
	let quoted = false;
	let begunQuoted = false;
	let endedQuoted = false;
	let partiallyQuoted = false;
	let processQuote = ()=>{
		if (quoted){
			endedQuoted = true
			quoted = false;
		} else{
			if (entry == ''){
				begunQuoted = true
			} else {
				partiallyQuoted = true;
			}
			quoted = true;
		}
	}
	let cleanEntry = ()=>{
		entry = entry.trim().slice(1, entry.length-1);
	}
	let resetParameters = ()=>{
		entry = ''
		quoted = false;
		begunQuoted = false;
		endedQuoted = false;
		partiallyQuoted = false;
	}
	// get rows
	for (let c of input.split('\n')[0]){
		if (c == '"'){
			processQuote()
		}
		if ((c == ',') && !quoted){
			if (begunQuoted && endedQuoted && !partiallyQuoted){
				cleanEntry()
			}
			csv[entry.trim()] = []
			resetParameters()
			continue;
		}
		if (c == ' ' && entry == ''){
			continue
		}
		entry += c
	}
	if (entry != ''){
		if (begunQuoted && endedQuoted && !partiallyQuoted){
			cleanEntry()
		}
		csv[entry.trim()] = []
		resetParameters()
	}

	let rows = Object.keys(csv);
	let row, rowId = 0;
	let waitingEndOfLine = false;
	// get columns
	let inputBody = input.slice(input.split('\n')[0].length + 1, input.length);
	for (let i=0; i<inputBody.length; i++){
		let c = inputBody[i];
		if (waitingEndOfLine){
			if(c != '\n'){
				continue
			} else{
				waitingEndOfLine = false
			}
		}
		if ((entry + c).trim() == ''){
			continue;
		}
		if (c == '"'){
			processQuote()
		}
		if ((c == ',' && !quoted) || c == '\n'){
			if (begunQuoted && endedQuoted && !partiallyQuoted){
				cleanEntry()
			}
			row = rows[rowId]
			csv[row].push(entry.trim());
			rowId = (rowId + 1)% rows.length;
			if (c == '\n'){
				if (rowId <= rows.length-1 && rowId != 0){
					for (let i=1; i<=(rows.length-rowId); i++){
						csv[rows[rowId + i - 1]].push('');
					}
				}
				rowId = 0
			} else if (rowId == 0){
				waitingEndOfLine = true;
			}
			
			resetParameters()
			continue;
		}
		entry += c
	}
	if (entry != ''){
		if (begunQuoted && endedQuoted && !partiallyQuoted){
			cleanEntry()
		}
		row = rows[rowId]
		csv[row].push(entry.trim());
	}
	if (rowId < rows.length-1){
		for (let i=1; i<=(rows.length-(1+rowId)); i++){
			csv[rows[rowId + i]].push('');
		}
	}
	console.log(csv)
	
	// apply pattern
	let readingVariable = false;
	let staticEntry = '';
	let variableEntry = '';
	let columnsSize = csv[rows[0]].length
	let bulkCreation = [];
	for (let i = 0; i<columnsSize; i++){
		bulkCreation.push('');
	}
	for (let c of pattern){
		if (c == "{" && !readingVariable){
			readingVariable = true;
			for (let i in bulkCreation){
				bulkCreation[i] += staticEntry;
			}
			staticEntry = '';
		}
		if (readingVariable){
			variableEntry += c;
			if (c == "}"){
				readingVariable = false;
				variableEntry = variableEntry.slice(1, variableEntry.length - 1).trim();
				if (rows.indexOf(variableEntry) != -1){
					for (let columnId in csv[variableEntry]){
						bulkCreation[columnId] += csv[variableEntry][columnId];
					}
				} else{
					for (let i in bulkCreation){
						bulkCreation[i] += '{' + variableEntry + '}';
					}
				}
				variableEntry = '';
			}
		} else{
			staticEntry += c;
		}
	}
	if (staticEntry != ''){
		for (let i in bulkCreation){
			bulkCreation[i] += staticEntry;
		}
	}
	
	outputElm.readOnly = false
	outputElm.value = bulkCreation.join("\n");
	outputElm.readOnly = true
	document.getElementById("count").textContent = bulkCreation.length;
}
