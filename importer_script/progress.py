from datetime import datetime
def progress(i_val, nrows, name):
    if nrows < 100:
        tenp = (nrows / 100) * 10
        if i_val % tenp == 0:
            percent = (i_val / nrows) * 100
        print(datetime.now().time(), name, (i_val / nrows) * 100, "%")
    else:
        tenp = (nrows // 100) * 10
        if i_val % tenp == 0:
            percent = (i_val / nrows) * 100
            print(datetime.now().time(), name, round(percent, 2), "%")