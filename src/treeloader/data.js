const ishashmap=true;
const datajson =
{
    'content': 'sample',
    'children': [
        {
            'content': 'collections',
            'children': [
                {
                    'content': 'list',
                    'children': [
                        {
                            'content': 'list_create'
                        },
                        {
                            'content': 'list_add_elment'
                        }
                    ]
                },
                {
                    'content': 'map',
                    'children': [
                        {
                            'content': 'map_create'
                        },
                        {
                            'content': 'map_add_element',
                            'children': [
                                {
                                    'content': 'map_create_keyvalue_pair'
                                }
                            ]
                        },
                        {
                            'content': 'map_search_element'
                        }
                    ]
                },
                {
                    'content': 'heap',
                    'children': [
                        {
                            'content': 'heap_create',
                            'children': [
                                {
                                    'content': 'collections'
                                }
                            ]
                        },
                        {
                            'content': 'heap_add_element'
                        }
                    ]
                },
                {
                    'content': 'array'
                }
            ]
        }
    ]
};
var datajson_1 = datajson;
var ishashmap_1 = ishashmap;

var data = {
    datajson: datajson_1,
    ishashmap: ishashmap_1
};

export default data;
export { data as __moduleExports };
export { datajson_1 as datajson };
export { ishashmap_1 as ishashmap };