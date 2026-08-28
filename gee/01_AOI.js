// ============================================================
// FILE    : 01_AOI.js
// TUJUAN  : Memilih dan memvalidasi AOI Provinsi Sulawesi Selatan
// SUMBER  : FAO GAUL 2015 Level 1
// Validation status : PASS
// Feature count     : 1
// Validated region  : Provinsi Sulawesi Selatan
// Boundary source   : FAO GAUL 2015 Level 1
// ============================================================

// 1. Memuat batas administrasi level provinsi.
var adminLevel1 = ee.FeatureCollection(
  'FAO/GAUL/2015/level1'
);

// 2. Memilih seluruh provinsi di Indonesia.
var indonesia = adminLevel1.filter(
  ee.Filter.eq('ADM0_NAME', 'Indonesia')
);

// 3. Menampilkan nama-nama provinsi yang tersimpan di GAUL.
var provinceNames = indonesia
  .aggregate_array('ADM1_NAME')
  .distinct()
  .sort();

print('Daftar nama provinsi Indonesia:', provinceNames);
print('Jumlah provinsi Indonesia:', indonesia.size());

// 4. Mencoba nama Indonesia dan Inggris.   
var aoi = indonesia.filter(
  ee.Filter.or(
    ee.Filter.eq('ADM1_NAME', 'Sulawesi Selatan'),
    ee.Filter.eq('ADM1_NAME', 'South Sulawesi')
  )
);

// 5. Validasi AOI.
print('Jumlah fitur AOI:', aoi.size());
print('AOI terpilih:', aoi);
print('Properti AOI:', aoi.first());

// 6. Menampilkan AOI.
Map.centerObject(aoi, 7);

var aoiStyle = {
  color: 'FF0000',
  fillColor: '00000000',
  width: 3
};

Map.addLayer(
  aoi.style(aoiStyle),
  {},
  'AOI Provinsi Sulawesi Selatan'
);