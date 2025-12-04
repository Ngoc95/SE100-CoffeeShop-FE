// This is just the updated table section that needs to replace lines ~414-535

          {/* Data Table */}
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-amber-950">Danh sách yêu cầu</CardTitle>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Tìm theo tên món..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead>Tên món đề xuất</TableHead>
                      <TableHead>Nhân viên gửi</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          Không có yêu cầu nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request, index) => {
                        const isExpanded = expandedRequestId === request.id;
                        
                        return (
                          <Fragment key={request.id}>
                            {/* Main Row */}
                            <TableRow 
                              className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                              onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}
                            >
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </TableCell>
                              <TableCell className="text-center text-neutral-600">{index + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm text-slate-900">{request.suggestedName}</p>
                                  {request.suggestedCategory && (
                                    <p className="text-xs text-slate-500">{request.suggestedCategory}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <span className="text-sm">{request.staffName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>
                                    {request.timestamp.toLocaleDateString('vi-VN')} {request.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="truncate text-sm text-slate-600">{request.note}</p>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                            </TableRow>

                            {/* Expanded Detail Row */}
                            {isExpanded && (
                              <TableRow className="bg-amber-50/30">
                                <TableCell colSpan={7} className="p-0">
                                  <div className="p-6 space-y-6">
                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <Label className="text-slate-500 text-xs">Nhân viên gửi</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="text-sm">{request.staffName}</p>
                                            <p className="text-xs text-slate-500">{request.staffId}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Thời gian gửi</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Clock className="w-5 h-5 text-slate-400" />
                                          <p className="text-sm">
                                            {request.timestamp.toLocaleDateString('vi-VN', { 
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}, {request.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Danh mục đề xuất</Label>
                                        <p className="mt-2 text-sm">{request.suggestedCategory || 'Chưa xác định'}</p>
                                      </div>

                                      <div>
                                        <Label className="text-slate-500 text-xs">Giá đề xuất</Label>
                                        <p className="mt-2 text-sm">{request.suggestedPrice?.toLocaleString('vi-VN')}đ</p>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Mô tả chi tiết</Label>
                                      <p className="mt-2 p-3 bg-white rounded-lg text-sm">{request.description || 'Không có mô tả'}</p>
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Công thức tạm thời</Label>
                                      <p className="mt-2 p-3 bg-white rounded-lg whitespace-pre-wrap text-sm">{request.suggestedRecipe || 'Chưa có công thức'}</p>
                                    </div>

                                    <div>
                                      <Label className="text-slate-500 text-xs">Ghi chú từ nhân viên</Label>
                                      <p className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm">{request.note}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    {request.status === 'pending' && (
                                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200">
                                        <Button
                                          variant="outline"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRequests(requests.map(req =>
                                              req.id === request.id ? { ...req, status: 'rejected' as const } : req
                                            ));
                                            setExpandedRequestId(null);
                                          }}
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Từ chối yêu cầu
                                        </Button>
                                        <Button
                                          className="bg-blue-600 hover:bg-blue-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRequest(request);
                                            setFormData({
                                              name: request.suggestedName,
                                              code: 'AUTO',
                                              category: request.suggestedCategory || '',
                                              unit: 'ly',
                                              price: request.suggestedPrice || 0,
                                              description: request.description || '',
                                              status: 'active',
                                            });
                                            setSelectedView('create');
                                          }}
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Tạo món mới (BM1)
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
