# The following code will search 'mm/dd/yyyy' (e.g. NOV/30/2016 ),
# and replace with 'mm-dd-yyyy' in multi-line mode.
import re
with open ('ndata.txt', 'r' ) as f:
    content = f.read()

    start_str = 'CfgTRES';
    end_str = 'CapWatts';

    start_str_2 = 'OS=';
    end_str_2 = 'RealMemory';

    remove_CfgTRES = re.sub('{}.*{}'.format(start_str, end_str), r'{}'.format(end_str), content, flags = re.M)
    removeOS = re.sub('{}.*{}'.format(start_str_2, end_str_2), r'{}'.format(end_str_2), remove_CfgTRES, flags = re.M)
    removeDoubleSpaces = re.sub(r'  ', r' ', removeOS, flags = re.M)
    addBeginningSpace = re.sub('(^Node)', r' \1', removeDoubleSpaces, flags = re.M)
    addQuotesToKey = re.sub(r'( .*nid)', r'Z\1Z', addBeginningSpace, flags = re.M)

    print(addQuotesToKey)
