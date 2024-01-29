#from lxml import etree
import json
import xml.etree.ElementTree as ET
import os
'''
str='20240129010203 +0800'
print(str[8:10])
print(str[10:12])
exit()
str={"ch1": "CCTV1","ch2": "CCTV2"}
print(str['ch1'])
exit()
'''



def write(file_path_name,str):
    file_path=os.path.dirname(file_path_name)
    file_name=os.path.basename(file_path_name)
    if not os.path.exists(file_path):
        os.makedirs(file_path)

    fpp=open(file_path_name,'w')
    fpp.write(str)
    fpp.close


xml_path='./e.xml'
tree=ET.parse(xml_path)
#root=ET.XML(content)
root=tree.getroot()
#print(root) #会显示tv
#channels=root.findall("channel")
#print(channels)
channel_info={}
programme_info=[]
channel_id='0'
date='20240101'
name=''
for child in root:
    if child.tag=='channel':
        #print(channel.tag)
        #print(child.attrib['id'])
        #print(child[0].text)
        channel_info['ch'+child.attrib['id']]=child[0].text


    if child.tag=='programme':
        if child.attrib['channel']!=channel_id or child.attrib['start'][0:8]!=date:
            epg={}
            epg['date']=date
            epg['name']=name
            epg['data']=programme_info
            write('./json/'+date+'/'+name+'.json',json.dumps(epg,ensure_ascii=False))
            programme_info=[]

            channel_id=child.attrib['channel']
            date=child.attrib['start'][0:8]
            name=channel_info['ch'+channel_id]

            
            #break
        channel_id=child.attrib['channel']
        programme={}
        programme['start']=child.attrib['start'][8:10]+":"+child.attrib['start'][10:12]
        programme['end']=child.attrib['stop'][8:10]+":"+child.attrib['stop'][10:12]
        programme['title']=child[0].text
        programme_info.append(programme)
