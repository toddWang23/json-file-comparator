# JSON File Comparator

> JSON File Comparator can compare two JSON files, compare result is based on [JSONPath](https://en.wikipedia.org/wiki/JSONPath), then write result into another file. It will compare nodes at same level, based on node attribute, generate compare result.

Compared with other packages, it focus on big file comparasion, which will be out of memory if all loaded into memory.

Compare result has types:

1. value_change: for the same node name, its value is changed .
2. move: node is moved compared with same-name node at `reference` file.
3. add: node is new added.
4. removed: node is deleted.
5. move_change: node is moved besides value changed.

There are three files involved:

Reference file: benchmark of the two compared file. All compared result above is based on this file.

Compare file: compared file with reference file, generate node difference as above.

Output file: file that write comparasion result into.

## Usage

It accept four parameters as below:

### Command

> node json-file-comparator --reference=reference-file-path --compare=compare-file-path --output=output-file-path --size=10240

`reference`: reference file path

`compare`: compare file path

`output`: output file path

`size`: read file size. Change as memory requirement.

### Funtion call


compare result is flattened because of performance issue while sync write. Basically it's like:

```
{
    "$.added-node": {
        "type": "add",
        "content": "newly added content, based on type various, it can be string/array/object/number"
    }, 
    "$.removed-node": {
        "type": "removed",
        "content": "removed content, based on type various, it can be string/array/object/number"
    },
    "$.moved-node": {
        "type": "move",
        "prevIndex": 0,
        "changedIndex": 2
    }, 
    "$.value-change-node": {
        "type": "value_change",
        "prevValue": "previous content in reference file, based on type various, it can be string/array/object/number",
        "changedValue": "updated content in compare file, based on type various, it can be string/array/object/number"
    },
    "$.move-change-node": {
        "type": "move_change",
        "prevIndex": 0,
        "changedIndex": 2,
         "prevValue": "previous content in reference file, based on type various, it can be string/array/object/number",
        "changedValue": "updated content in compare file, based on type various, it can be string/array/object/number"
    }
}
```

## Roadmap

* [ ]  Improve file read performance. Because it takes time when open file frequently, and read file based on file index, packages like `highland` might help.
* [ ]  Array comparasion. Array should not be compared based on key, value should be better choice. It can also help when it comes to **key change** scenario.
* [ ]  Adjustable memory usage parameters.
* [ ]  Online website. Which accept file upload and download comparasion result file, also JSON file comparasion result difference display.
* [ ]  In-memory JSON object comparasion.

## Demo

Not availble for now but will be.
